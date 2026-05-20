'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useAuthStore } from '@/stores/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuthStore();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Register in auth store
      const success = await register({
        name: formData.fullName,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'customer', // Always customer for new registrations
      });
      
      if (success) {
        // ALSO save to localStorage directly as backup
        const existingUsers = JSON.parse(localStorage.getItem('fittrust-users') || '[]');
        
        // Check if user already exists
        if (!existingUsers.some((u: any) => u.email === formData.email)) {
          const newUser = {
            id: 'user-' + Date.now(),
            name: formData.fullName,
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone || '',
            role: 'customer',
            status: 'active',
            createdAt: new Date().toISOString(),
          };
          existingUsers.push(newUser);
          localStorage.setItem('fittrust-users', JSON.stringify(existingUsers));
          
          // Also save to registered-users
          const registeredUsers = JSON.parse(localStorage.getItem('registered-users') || '[]');
          registeredUsers.push(newUser);
          localStorage.setItem('registered-users', JSON.stringify(registeredUsers));
        }
        
        router.push('/');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">FITTRUST MEDICALS</h1>
          <p className="text-gray-500 text-sm">Healthcare Supplies</p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 border border-gray-200">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to existing account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
            {error && (
              <Alert type="error" message={error} className="mb-4" onClose={() => setError('')} />
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Input
                  label="Full Name *"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full"
                />
              </div>

              <div>
                <Input
                  label="Email address *"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full"
                />
              </div>

              <div>
                <Input
                  label="Phone number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="w-full"
                />
              </div>

              <div>
                <Input
                  label="Password *"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a password (min 6 characters)"
                  className="w-full"
                />
              </div>

              <div>
                <Input
                  label="Confirm Password *"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm your password"
                  className="w-full"
                />
              </div>

              <Button type="submit" fullWidth isLoading={loading}>
                Create Account
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}