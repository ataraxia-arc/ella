<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $products = $request->user()->products();

        $totals = (clone $products)
            ->selectRaw('COUNT(*) as total_products')
            ->selectRaw('COALESCE(SUM(stock_quantity), 0) as total_units')
            ->selectRaw('COALESCE(SUM(price * stock_quantity), 0) as total_value')
            ->selectRaw('SUM(CASE WHEN stock_quantity > 0 AND stock_quantity <= low_stock_threshold THEN 1 ELSE 0 END) as low_stock')
            ->selectRaw('SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock')
            ->selectRaw('SUM(CASE WHEN stock_quantity > low_stock_threshold THEN 1 ELSE 0 END) as in_stock')
            ->first();

        $byCategory = (clone $products)
            ->select('category')
            ->selectRaw('COUNT(*) as count')
            ->selectRaw('COALESCE(SUM(stock_quantity), 0) as units')
            ->selectRaw('COALESCE(SUM(price * stock_quantity), 0) as value')
            ->groupBy('category')
            ->orderByDesc('count')
            ->get()
            ->map(fn ($row) => [
                'category' => $row->category,
                'count' => (int) $row->count,
                'units' => (int) $row->units,
                'value' => $this->money($row->value),
            ]);

        return response()->json([
            'total_products' => (int) ($totals->total_products ?? 0),
            'total_units' => (int) ($totals->total_units ?? 0),
            'total_value' => $this->money($totals->total_value ?? 0),
            'low_stock_count' => (int) ($totals->low_stock ?? 0),
            'out_of_stock_count' => (int) ($totals->out_of_stock ?? 0),
            'in_stock_count' => (int) ($totals->in_stock ?? 0),
            'by_category' => $byCategory,
            'recent' => (clone $products)->latest()->limit(5)->get(),
            'low_stock' => (clone $products)
                ->where('stock_quantity', '>', 0)
                ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                ->orderBy('stock_quantity')
                ->limit(6)
                ->get(),
        ]);
    }

    private function money(mixed $value): string
    {
        return number_format((float) $value, 2, '.', '');
    }
}
