<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = $request->user()->products()->latest();
        $search = trim((string) $request->query('search', ''));
        $category = trim((string) $request->query('category', ''));
        $status = (string) $request->query('status', 'all');
        $sort = (string) $request->query('sort', 'newest');

        if ($search !== '') {
            $query->where(function ($inner) use ($search) {
                $like = '%'.$search.'%';
                $inner->where('name', 'like', $like)
                    ->orWhere('sku', 'like', $like)
                    ->orWhere('category', 'like', $like);
            });
        }

        if ($category !== '') {
            $query->where('category', $category);
        }

        if ($status === 'out') {
            $query->where('stock_quantity', 0);
        } elseif ($status === 'low') {
            $query->where('stock_quantity', '>', 0)
                ->whereColumn('stock_quantity', '<=', 'low_stock_threshold');
        } elseif ($status === 'in') {
            $query->whereColumn('stock_quantity', '>', 'low_stock_threshold');
        }

        match ($sort) {
            'name' => $query->reorder('name'),
            'price_asc' => $query->reorder('price'),
            'price_desc' => $query->reorder('price', 'desc'),
            'stock' => $query->reorder('stock_quantity'),
            default => $query->reorder('created_at', 'desc'),
        };

        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);
        $product = $request->user()->products()->create($data);

        return response()->json(['data' => $product->fresh()], 201);
    }

    public function show(Request $request, Product $product): JsonResponse
    {
        $this->authorizeOwner($request, $product);

        return response()->json(['data' => $product]);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $this->authorizeOwner($request, $product);
        $product->update($this->validated($request, $product->id));

        return response()->json(['data' => $product->fresh()]);
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $this->authorizeOwner($request, $product);
        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    private function authorizeOwner(Request $request, Product $product): void
    {
        abort_unless((int) $product->user_id === (int) $request->user()->id, 404);
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $userId = $request->user()->id;

        return $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'sku' => [
                'required',
                'string',
                'max:64',
                Rule::unique('products', 'sku')->where('user_id', $userId)->ignore($ignoreId),
            ],
            'category' => ['required', 'string', 'max:80'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0', 'max:9999999999.99'],
            'stock_quantity' => ['required', 'integer', 'min:0', 'max:1000000'],
            'low_stock_threshold' => ['required', 'integer', 'min:0', 'max:1000000'],
        ]);
    }
}
