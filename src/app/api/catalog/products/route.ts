import { NextRequest, NextResponse } from 'next/server';

// Backend API URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://fittrustmedicals-backend.onrender.com';

// GET /api/catalog/products - Get all products from backend
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/catalog/products`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch products from backend');
    }
    
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      products: data.products || data,
      total: data.products?.length || data.length || 0,
      source: 'backend'
    });
  } catch (error) {
    console.error('GET products error:', error);
    
    // Return empty array instead of error
    return NextResponse.json({
      success: true,
      products: [],
      total: 0,
      source: 'fallback'
    });
  }
}

// POST /api/catalog/products - Add a new product to backend
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Received product data:', body);
    
    // Forward to backend API
    const response = await fetch(`${BACKEND_URL}/api/catalog/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to save product to backend');
    }
    
    console.log('Product saved to backend:', data);
    
    return NextResponse.json({
      success: true,
      data: data.data || data,
      message: 'Product added successfully'
    });
  } catch (error) {
    console.error('POST product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add product' },
      { status: 500 }
    );
  }
}

// PUT /api/catalog/products - Update a product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID required' },
        { status: 400 }
      );
    }
    
    const response = await fetch(`${BACKEND_URL}/api/catalog/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update product');
    }
    
    return NextResponse.json({
      success: true,
      data: data.data || data,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('PUT product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/catalog/products - Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID required' },
        { status: 400 }
      );
    }
    
    const response = await fetch(`${BACKEND_URL}/api/catalog/products/${id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete product');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('DELETE product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}