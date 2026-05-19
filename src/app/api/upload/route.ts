import { NextRequest, NextResponse } from 'next/server';

// Cloudinary configuration
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dijqk2arj';
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'fittrust_products';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const category = data.get('category') as string || 'products';

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file uploaded' 
      }, { status: 400 });
    }

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only images are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    // Prepare FormData for Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', `fittrust-products/${category}`);
    
    // Optional: Add transformations for optimization
    formData.append('quality', 'auto:good');
    formData.append('fetch_format', 'auto');
    formData.append('flags', 'attachment');

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('Cloudinary upload error:', result);
      return NextResponse.json({ 
        success: false, 
        error: result.error?.message || 'Upload failed' 
      }, { status: response.status });
    }

    console.log(`✅ File uploaded successfully to Cloudinary: ${result.public_id}`);

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      filename: result.original_filename,
      publicId: result.public_id,
      size: result.bytes,
      type: result.format,
      category: category,
      width: result.width,
      height: result.height,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({
      success: false,
      error: 'Upload failed. Please try again.'
    }, { status: 500 });
  }
}

// GET method to list uploaded files (optional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'products';
    
    // For now, return empty array
    // You can implement Cloudinary API search later if needed
    return NextResponse.json({
      success: true,
      files: [],
      category: category,
      message: 'List files feature coming soon'
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch files'
    }, { status: 500 });
  }
}