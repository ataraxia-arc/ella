<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InventoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_persists_a_hashed_password(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Marc Analyst',
            'email' => 'marc.grxx@example.com',
            'password' => 'inventory-pass',
            'password_confirmation' => 'inventory-pass',
        ]);

        $response->assertCreated()->assertJsonPath('user.email', 'marc.grxx@example.com');
        $this->assertDatabaseHas('users', ['email' => 'marc.grxx@example.com']);
        $this->assertNotSame('inventory-pass', User::first()->password);
    }

    public function test_duplicate_email_is_rejected(): void
    {
        User::factory()->create(['email' => 'marc.grxx@example.com']);

        $this->postJson('/api/register', [
            'name' => 'Other',
            'email' => 'marc.grxx@example.com',
            'password' => 'inventory-pass',
            'password_confirmation' => 'inventory-pass',
        ])->assertStatus(422);
    }

    public function test_login_and_logout(): void
    {
        User::factory()->create([
            'email' => 'marc.grxx@example.com',
            'password' => 'inventory-pass',
        ]);

        $this->postJson('/api/login', [
            'email' => 'marc.grxx@example.com',
            'password' => 'wrong-pass',
        ])->assertStatus(422);

        $this->postJson('/api/login', [
            'email' => 'marc.grxx@example.com',
            'password' => 'inventory-pass',
        ])->assertOk()->assertJsonPath('user.email', 'marc.grxx@example.com');

        $this->postJson('/api/logout')->assertOk();
        $this->getJson('/api/user')->assertUnauthorized();
    }

    public function test_dashboard_and_products_require_authentication(): void
    {
        $this->getJson('/api/dashboard/stats')->assertUnauthorized();
        $this->getJson('/api/products')->assertUnauthorized();
        $this->postJson('/api/products', [])->assertUnauthorized();
    }

    public function test_product_crud_dashboard_math_and_account_isolation(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();

        Sanctum::actingAs($owner);

        $created = $this->postJson('/api/products', [
            'name' => 'Wireless Keyboard',
            'sku' => 'KB-001',
            'category' => 'Electronics',
            'description' => 'Compact wireless keyboard',
            'price' => 1500,
            'stock_quantity' => 20,
            'low_stock_threshold' => 5,
        ])->assertCreated();

        $id = $created->json('data.id');
        $this->assertDatabaseHas('products', [
            'id' => $id,
            'user_id' => $owner->id,
            'sku' => 'KB-001',
            'stock_quantity' => 20,
        ]);

        $this->getJson('/api/dashboard/stats')
            ->assertOk()
            ->assertJsonPath('total_products', 1)
            ->assertJsonPath('total_units', 20)
            ->assertJsonPath('total_value', '30000.00');

        $this->putJson("/api/products/{$id}", [
            'name' => 'Wireless Keyboard',
            'sku' => 'KB-001',
            'category' => 'Electronics',
            'description' => 'Compact wireless keyboard',
            'price' => 1500,
            'stock_quantity' => 15,
            'low_stock_threshold' => 5,
        ])->assertOk()->assertJsonPath('data.stock_quantity', 15);

        $this->getJson('/api/dashboard/stats')->assertJsonPath('total_value', '22500.00');

        Sanctum::actingAs($other);
        $this->getJson("/api/products/{$id}")->assertNotFound();
        $this->putJson("/api/products/{$id}", [
            'name' => 'Stolen',
            'sku' => 'KB-001',
            'category' => 'Electronics',
            'price' => 1,
            'stock_quantity' => 1,
            'low_stock_threshold' => 1,
        ])->assertNotFound();
        $this->deleteJson("/api/products/{$id}")->assertNotFound();
        $this->getJson('/api/products')->assertOk()->assertJsonCount(0, 'data');
        $this->getJson('/api/dashboard/stats')->assertJsonPath('total_products', 0);

        Sanctum::actingAs($owner);
        $this->deleteJson("/api/products/{$id}")->assertOk();
        $this->assertDatabaseMissing('products', ['id' => $id]);
        $this->getJson('/api/dashboard/stats')
            ->assertJsonPath('total_products', 0)
            ->assertJsonPath('total_value', '0.00');
    }
}
