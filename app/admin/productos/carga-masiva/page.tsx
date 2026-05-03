'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Papa from 'papaparse';
import { ArrowLeft, Upload, Download, CheckCircle2, XCircle, AlertCircle, Loader2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Category, Brand } from '@/types';
import { slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface RawRow {
  [key: string]: string;
}

interface ParsedVariant {
  nombre: string;
  precio: number;
  stock: number;
  sku?: string;
}

interface ParsedProduct {
  name: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  base_price: number;
  category_name: string | null;
  brand_name: string | null;
  finish: string | null;
  base_type: string | null;
  coverage_sqm_per_liter: number | null;
  dry_time_hours: number | null;
  coats_required: number | null;
  tags: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  variants: ParsedVariant[];
}

interface ProductRow {
  raw: RawRow;
  parsed: ParsedProduct | null;
  errors: string[];
  status: 'pending' | 'uploading' | 'success' | 'error';
  errorMsg?: string;
}

// Normaliza nombres de columnas para aceptar variaciones en español/inglés
const COL_MAP: Record<string, string> = {
  nombre: 'name', name: 'name', producto: 'name',
  sku: 'sku', codigo: 'sku', code: 'sku',
  descripcion_corta: 'short_description', short_description: 'short_description', resumen: 'short_description',
  descripcion: 'description', description: 'description',
  precio_base: 'base_price', precio: 'base_price', price: 'base_price', base_price: 'base_price', 'precio base': 'base_price',
  categoria: 'category_name', category: 'category_name', 'categoría': 'category_name',
  marca: 'brand_name', brand: 'brand_name',
  acabado: 'finish', finish: 'finish',
  tipo_base: 'base_type', base_type: 'base_type', base: 'base_type', tipo: 'base_type',
  cobertura: 'coverage_sqm_per_liter', coverage: 'coverage_sqm_per_liter', 'cobertura_m2_por_litro': 'coverage_sqm_per_liter',
  tiempo_secado: 'dry_time_hours', dry_time: 'dry_time_hours', 'tiempo_secado_horas': 'dry_time_hours',
  manos: 'coats_required', coats: 'coats_required', 'manos_recomendadas': 'coats_required',
  tags: 'tags', etiquetas: 'tags',
  activo: 'is_active', active: 'is_active', is_active: 'is_active',
  destacado: 'is_featured', featured: 'is_featured', is_featured: 'is_featured',
  variantes: 'variants', variants: 'variants',
};

function normalizeKey(key: string): string {
  return key.toLowerCase().trim().replace(/\s+/g, '_').replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u').replace(/ñ/g, 'n');
}

const FINISH_MAP: Record<string, string> = {
  flat: 'flat', plano: 'flat', mate: 'flat', 'sin brillo': 'flat',
  matte: 'matte', mate2: 'matte',
  eggshell: 'eggshell', 'cascara de huevo': 'eggshell', 'cáscara de huevo': 'eggshell', 'cascara': 'eggshell',
  satin: 'satin', satinado: 'satin', satín: 'satin',
  'semi-gloss': 'semi-gloss', semigloss: 'semi-gloss', semibrill: 'semi-gloss', 'semi brillante': 'semi-gloss', semibrillante: 'semi-gloss',
  gloss: 'gloss', brillante: 'gloss', brillo: 'gloss',
  'high-gloss': 'high-gloss', highgloss: 'high-gloss', 'alto brillo': 'high-gloss', altobrillo: 'high-gloss',
};

function normalizeFinish(raw: string | undefined): string | null {
  if (!raw) return null;
  return FINISH_MAP[raw.toLowerCase().trim()] ?? null;
}

const VALID_BASE_TYPES = ['water', 'oil', 'epoxy', 'latex', 'acrylic'] as const;
const BASE_TYPE_MAP: Record<string, string> = {
  water: 'water', agua: 'water', 'al agua': 'water',
  oil: 'oil', aceite: 'oil', 'al aceite': 'oil', oleo: 'oil', óleo: 'oil',
  epoxy: 'epoxy', epoxi: 'epoxy', epóxi: 'epoxy',
  latex: 'latex', látex: 'latex', latx: 'latex',
  acrylic: 'acrylic', acrilico: 'acrylic', acrílico: 'acrylic', acrilica: 'acrylic', acrílica: 'acrylic',
};

function normalizeBaseType(raw: string | undefined): { value: string | null; warning: string | null } {
  if (!raw) return { value: null, warning: null };
  const key = raw.toLowerCase().trim();
  const mapped = BASE_TYPE_MAP[key];
  if (mapped) return { value: mapped, warning: null };
  return {
    value: null,
    warning: `Tipo de base "${raw}" no reconocido — se ignorará. Valores válidos: ${VALID_BASE_TYPES.join(', ')}`,
  };
}

function parseRow(raw: RawRow, categories: Category[], brands: Brand[]): { parsed: ParsedProduct | null; errors: string[] } {
  const errors: string[] = [];
  const mapped: Record<string, string> = {};

  for (const [k, v] of Object.entries(raw)) {
    const norm = normalizeKey(k);
    const field = COL_MAP[norm];
    if (field) mapped[field] = v?.trim() ?? '';
  }

  const name = mapped['name'];
  if (!name) { errors.push('Falta el nombre del producto'); }

  const basePriceStr = mapped['base_price'];
  const base_price = parseFloat(basePriceStr);
  if (!basePriceStr || isNaN(base_price) || base_price < 0) {
    errors.push('Precio base inválido o faltante');
  }

  if (errors.length > 0) return { parsed: null, errors };

  const catName = mapped['category_name'] || null;
  const brandName = mapped['brand_name'] || null;

  // Validate category/brand exist (warn, not error)
  if (catName && !categories.find(c => c.name.toLowerCase() === catName.toLowerCase())) {
    errors.push(`Categoría "${catName}" no encontrada (se dejará sin categoría)`);
  }
  if (brandName && !brands.find(b => b.name.toLowerCase() === brandName.toLowerCase())) {
    errors.push(`Marca "${brandName}" no encontrada (se dejará sin marca)`);
  }

  // Parse variants
  let variants: ParsedVariant[] = [];
  const variantsRaw = mapped['variants'];
  if (variantsRaw) {
    try {
      const parsed = JSON.parse(variantsRaw);
      if (Array.isArray(parsed)) {
        variants = parsed.map((v: any) => ({
          nombre: String(v.nombre || v.name || ''),
          precio: parseFloat(v.precio || v.price || 0),
          stock: parseInt(v.stock || 0),
          sku: v.sku || undefined,
        })).filter(v => v.nombre && !isNaN(v.precio));
      }
    } catch {
      errors.push('Columna "variantes" tiene formato JSON inválido');
    }
  }

  const tagsRaw = mapped['tags'];
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : null;

  const parseBool = (v: string | undefined, def: boolean) => {
    if (!v) return def;
    return v.toLowerCase() === 'true' || v === '1' || v.toLowerCase() === 'si' || v.toLowerCase() === 'sí';
  };

  return {
    parsed: {
      name,
      sku: mapped['sku'] || null,
      short_description: mapped['short_description'] || null,
      description: mapped['description'] || null,
      base_price,
      category_name: catName,
      brand_name: brandName,
      finish: normalizeFinish(mapped['finish']),
      base_type: normalizeBaseType(mapped['base_type']).value,
      coverage_sqm_per_liter: mapped['coverage_sqm_per_liter'] ? parseFloat(mapped['coverage_sqm_per_liter']) : null,
      dry_time_hours: mapped['dry_time_hours'] ? parseFloat(mapped['dry_time_hours']) : null,
      coats_required: mapped['coats_required'] ? parseInt(mapped['coats_required']) : null,
      tags,
      is_active: parseBool(mapped['is_active'], true),
      is_featured: parseBool(mapped['is_featured'], false),
      variants,
    },
    errors,
  };
}

const TEMPLATE_CSV = `nombre,sku,descripcion_corta,descripcion,precio_base,categoria,marca,acabado,tipo_base,cobertura_m2_por_litro,tiempo_secado_horas,manos_recomendadas,tags,activo,destacado,variantes
Pintura Látex Interior,PLI-001,Pintura de alta calidad para interiores,Pintura látex ideal para paredes interiores con excelente cubrimiento,150.00,Pinturas Interiores,MAPEX,matte,latex,10,2,2,"interior,latex",true,false,"[{""nombre"":""1L"",""precio"":150,""stock"":20},{""nombre"":""4L"",""precio"":500,""stock"":10},{""nombre"":""19L"",""precio"":2000,""stock"":5}]"
Esmalte Brillante Exterior,EBE-002,Esmalte para exteriores con alta resistencia,,280.00,Pinturas Exteriores,MAPEX,gloss,oil,8,4,2,"exterior,esmalte",true,true,"[{""nombre"":""1L"",""precio"":280,""stock"":15},{""nombre"":""4L"",""precio"":950,""stock"":8}]"
`;

export default function CargaMasivaPage() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const supabase = createClient();
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []));
    supabase.from('brands').select('*').then(({ data }) => setBrands(data || []));
  }, []);

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      showToast('Solo se aceptan archivos CSV', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      // Try UTF-8 first; if replacement chars appear, fall back to Windows-1252
      let text = new TextDecoder('utf-8').decode(buffer);
      if (text.includes('�')) {
        text = new TextDecoder('windows-1252').decode(buffer);
      }
      Papa.parse<RawRow>(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length === 0) {
            showToast('El archivo CSV está vacío', 'error');
            return;
          }
          const parsed = results.data.map((raw) => {
            const { parsed, errors } = parseRow(raw, categories, brands);
            return { raw, parsed, errors: errors.filter(e => !e.includes('no encontrada')), status: 'pending' as const, errorMsg: undefined };
          });
          setRows(parsed);
          setUploadedCount(0);
          showToast(`${parsed.length} filas cargadas`, 'success');
        },
        error: () => showToast('Error al leer el archivo CSV', 'error'),
      });
    };
    reader.readAsArrayBuffer(file);
  }, [categories, brands, showToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_productos_mapex.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateUniqueSlug = async (supabase: ReturnType<typeof createClient>, baseName: string): Promise<string> => {
    let slug = slugify(baseName);
    let attempt = 0;
    while (true) {
      const candidate = attempt === 0 ? slug : `${slug}-${attempt}`;
      const { data } = await supabase.from('products').select('id').eq('slug', candidate).maybeSingle();
      if (!data) return candidate;
      attempt++;
    }
  };

  const uploadAll = async () => {
    const validRows = rows.filter(r => r.parsed && r.errors.length === 0);
    if (validRows.length === 0) {
      showToast('No hay filas válidas para subir', 'error');
      return;
    }

    setUploading(true);
    const supabase = createClient();
    let success = 0;
    let failed = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.parsed || row.errors.length > 0) continue;

      setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'uploading' } : r));

      try {
        const p = row.parsed;

        const catId = p.category_name
          ? categories.find(c => c.name.toLowerCase() === p.category_name!.toLowerCase())?.id ?? null
          : null;
        const brandId = p.brand_name
          ? brands.find(b => b.name.toLowerCase() === p.brand_name!.toLowerCase())?.id ?? null
          : null;

        const slug = await generateUniqueSlug(supabase, p.name);

        const { data: product, error } = await supabase.from('products').insert({
          name: p.name,
          slug,
          sku: p.sku,
          short_description: p.short_description,
          description: p.description,
          base_price: p.base_price,
          category_id: catId,
          brand_id: brandId,
          finish: p.finish,
          base_type: p.base_type,
          coverage_sqm_per_liter: p.coverage_sqm_per_liter,
          dry_time_hours: p.dry_time_hours,
          coats_required: p.coats_required,
          tags: p.tags,
          is_active: p.is_active,
          is_featured: p.is_featured,
        }).select().single();

        if (error) throw new Error(error.message);

        if (p.variants.length > 0) {
          await supabase.from('product_variants').insert(
            p.variants.map(v => ({
              product_id: product.id,
              name: v.nombre,
              price: v.precio,
              stock: v.stock,
              sku: v.sku ?? null,
              is_active: true,
            }))
          );
        }

        setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'success' } : r));
        success++;
        setUploadedCount(success);
      } catch (err: any) {
        setRows(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'error', errorMsg: err.message } : r));
        failed++;
      }
    }

    setUploading(false);
    showToast(`Carga completada: ${success} exitosos, ${failed} fallidos`, success > 0 ? 'success' : 'error');
  };

  const validCount = rows.filter(r => r.parsed && r.errors.length === 0).length;
  const warnCount = rows.filter(r => r.parsed && r.errors.length > 0).length;
  const errorCount = rows.filter(r => !r.parsed).length;

  const allActive = rows.every(r => !r.parsed || r.parsed.is_active);

  const toggleAllActive = () => {
    const next = !allActive;
    setRows(prev => prev.map(r =>
      r.parsed ? { ...r, parsed: { ...r.parsed, is_active: next } } : r
    ));
  };

  const toggleRow = (i: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/productos" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-gray-900">Carga masiva de productos</h1>
          <p className="text-gray-500">Sube un archivo CSV para importar múltiples productos a la vez</p>
        </div>
      </div>

      {/* Instructions + template download */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
        <FileText className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bold text-blue-900 text-sm mb-1">Formato esperado</p>
          <p className="text-blue-700 text-sm mb-3">
            El archivo CSV debe tener encabezados en la primera fila. Las columnas obligatorias son <strong>nombre</strong> y <strong>precio_base</strong>.
            Las variantes se ingresan en formato JSON: <code className="bg-blue-100 px-1 rounded text-xs">[{"{"}{"\"nombre\":\"1L\",\"precio\":150,\"stock\":10"}{"}"}{"}"}]</code>
          </p>
          <button onClick={downloadTemplate}
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors">
            <Download className="h-4 w-4" /> Descargar plantilla CSV
          </button>
        </div>
      </div>

      {/* Dropzone */}
      {rows.length === 0 && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all mb-6
            ${isDragging ? 'border-[#E8462A] bg-red-50' : 'border-gray-200 hover:border-[#E8462A] hover:bg-gray-50'}`}
        >
          <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-[#E8462A]' : 'text-gray-300'}`} />
          <p className="font-bold text-gray-700 mb-1">Arrastra tu archivo CSV aquí</p>
          <p className="text-sm text-gray-400">o haz clic para seleccionar</p>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} className="hidden" />
        </div>
      )}

      {/* Preview table */}
      {rows.length > 0 && (
        <>
          {/* Stats bar */}
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-bold">
              <CheckCircle2 className="h-4 w-4" /> {validCount} válidos
            </div>
            {warnCount > 0 && (
              <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full text-sm font-bold">
                <AlertCircle className="h-4 w-4" /> {warnCount} con advertencias
              </div>
            )}
            {errorCount > 0 && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-sm font-bold">
                <XCircle className="h-4 w-4" /> {errorCount} con errores
              </div>
            )}
            <div className="ml-auto flex gap-2">
              <button
                onClick={toggleAllActive}
                disabled={uploading}
                className="text-sm font-bold px-3 py-1.5 border rounded-xl transition-colors border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                {allActive ? 'Desactivar todos' : 'Activar todos'}
              </button>
              <button
                onClick={() => { setRows([]); setUploadedCount(0); }}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-200 rounded-xl transition-colors"
                disabled={uploading}
              >
                Cambiar archivo
              </button>
              <Button
                variant="primary"
                onClick={uploadAll}
                disabled={uploading || validCount === 0}
              >
                {uploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Subiendo {uploadedCount}/{validCount}...</>
                ) : (
                  <><Upload className="h-4 w-4" /> Subir {validCount} producto{validCount !== 1 ? 's' : ''}</>
                )}
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Variantes</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Activo</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, i) => (
                  <React.Fragment key={i}>
                    <tr className={`transition-colors ${row.status === 'success' ? 'bg-green-50' : row.status === 'error' ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                      <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-sm text-gray-900">{row.parsed?.name || <span className="text-red-400 italic">Sin nombre</span>}</p>
                        {row.parsed?.category_name && <p className="text-xs text-gray-400">{row.parsed.category_name}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{row.parsed?.sku || '—'}</td>
                      <td className="px-4 py-3 text-sm font-bold text-[#E8462A]">
                        {row.parsed?.base_price != null ? `$${row.parsed.base_price.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {row.parsed?.variants.length ? `${row.parsed.variants.length} variante(s)` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {row.parsed && row.status === 'pending' ? (
                          <button
                            onClick={() => setRows(prev => prev.map((r, idx) =>
                              idx === i && r.parsed ? { ...r, parsed: { ...r.parsed, is_active: !r.parsed.is_active } } : r
                            ))}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${row.parsed.is_active ? 'bg-green-500' : 'bg-gray-200'}`}
                          >
                            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${row.parsed.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.status === 'uploading' && (
                          <span className="flex items-center gap-1 text-xs text-blue-600 font-bold">
                            <Loader2 className="h-3 w-3 animate-spin" /> Subiendo...
                          </span>
                        )}
                        {row.status === 'success' && (
                          <span className="flex items-center gap-1 text-xs text-green-700 font-bold">
                            <CheckCircle2 className="h-3 w-3" /> Subido
                          </span>
                        )}
                        {row.status === 'error' && (
                          <span className="flex items-center gap-1 text-xs text-red-600 font-bold" title={row.errorMsg}>
                            <XCircle className="h-3 w-3" /> Error
                          </span>
                        )}
                        {row.status === 'pending' && row.errors.length > 0 && (
                          <span className="flex items-center gap-1 text-xs text-red-600 font-bold">
                            <XCircle className="h-3 w-3" /> {row.errors.length} error(es)
                          </span>
                        )}
                        {row.status === 'pending' && row.errors.length === 0 && (
                          <span className="flex items-center gap-1 text-xs text-green-700 font-bold">
                            <CheckCircle2 className="h-3 w-3" /> Listo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {(row.errors.length > 0 || row.errorMsg) && (
                          <button onClick={() => toggleRow(i)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                            {expandedRows.has(i) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedRows.has(i) && (row.errors.length > 0 || row.errorMsg) && (
                      <tr className="bg-red-50">
                        <td colSpan={7} className="px-4 py-2 pb-3">
                          <ul className="space-y-1">
                            {row.errors.map((e, j) => (
                              <li key={j} className="flex items-center gap-2 text-xs text-red-600">
                                <XCircle className="h-3 w-3 flex-shrink-0" /> {e}
                              </li>
                            ))}
                            {row.errorMsg && (
                              <li className="flex items-center gap-2 text-xs text-red-600">
                                <XCircle className="h-3 w-3 flex-shrink-0" /> {row.errorMsg}
                              </li>
                            )}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom action */}
          {rows.some(r => r.status === 'success') && (
            <div className="mt-6 flex justify-center">
              <Link href="/admin/productos">
                <Button variant="primary">Ver todos los productos</Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
