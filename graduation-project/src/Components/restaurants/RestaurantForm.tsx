import { useState } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
import { Card, Button, TextInput, Label } from 'flowbite-react';
import { addRestaurant, updateRestaurant } from '../../services/restaurant';
import type { AddRestaurantCommand, UpdateRestaurantCommand, ReturnRestaurantQuery } from '../../types/restaurant';

interface RestaurantFormProps {
  restaurant?: ReturnRestaurantQuery;
  onSave: (restaurant: ReturnRestaurantQuery) => void;
  onCancel: () => void;
}

const commonFeatures = [
  'Outdoor Seating',
  'Wine Bar',
  'Private Events',
  'Live Music',
  'Valet Parking',
  'Free WiFi',
  'Pet Friendly',
  'Delivery',
  'Takeout',
  'Kids Menu',
  'Wheelchair Accessible',
  'Reservations Recommended'
];

const commonCuisines = [
  'Italian',
  'Japanese',
  'French',
  'Chinese',
  'Mexican',
  'Indian',
  'Thai',
  'American',
  'Mediterranean',
  'Spanish',
  'Greek',
  'Korean',
  'Vietnamese',
  'Fusion'
];

const commonPriceRanges = ['$', '$$', '$$$', '$$$$'];

export default function RestaurantForm({ restaurant, onSave, onCancel }: RestaurantFormProps) {
  const isEditing = !!restaurant;
  
  const [formData, setFormData] = useState<AddRestaurantCommand>({
    name: restaurant?.name || '',
    description: restaurant?.description || '',
    cuisine: restaurant?.cuisine || '',
    address: restaurant?.address || '',
    phone: restaurant?.phone || '',
    email: restaurant?.email || '',
    website: restaurant?.website || '',
    priceRange: restaurant?.priceRange || '$$',
    location: restaurant?.location || '',
    hours: restaurant?.hours || '11:00 AM - 10:00 PM',
    features: restaurant?.features || [],
    image: restaurant?.image || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Restaurant name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.cuisine) {
      newErrors.cuisine = 'Cuisine type is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.hours.trim()) {
      newErrors.hours = 'Operating hours are required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      let result: ReturnRestaurantQuery;
      
      if (isEditing && restaurant) {
        const updateData: UpdateRestaurantCommand = {
          id: restaurant.id,
          ...formData
        };
        result = await updateRestaurant(updateData);
      } else {
        result = await addRestaurant(formData);
      }

      onSave(result);
    } catch (error) {
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to save restaurant' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof AddRestaurantCommand, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleFeature = (feature: string) => {
    const currentFeatures = formData.features || [];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    
    handleInputChange('features', newFeatures);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Restaurant' : 'Add New Restaurant'}
        </h2>
        <Button
          onClick={onCancel}
          color="light"
          className="!p-2"
        >
          <FaTimes />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{errors.submit}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Restaurant Name *</Label>
              <TextInput
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                color={errors.name ? 'failure' : undefined}
                placeholder="Enter restaurant name"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your restaurant..."
                required
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cuisine">Cuisine Type *</Label>
              <select
                id="cuisine"
                value={formData.cuisine}
                onChange={(e) => handleInputChange('cuisine', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.cuisine ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select cuisine type</option>
                {commonCuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
              {errors.cuisine && (
                <p className="text-red-500 text-sm mt-1">{errors.cuisine}</p>
              )}
            </div>

            <div>
              <Label htmlFor="priceRange">Price Range *</Label>
              <select
                id="priceRange"
                value={formData.priceRange}
                onChange={(e) => handleInputChange('priceRange', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.priceRange ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                {commonPriceRanges.map(price => (
                  <option key={price} value={price}>{price}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="location">Location *</Label>
              <TextInput
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                color={errors.location ? 'failure' : undefined}
                placeholder="e.g., Downtown, Midtown, etc."
                required
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Address *</Label>
              <TextInput
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                color={errors.address ? 'failure' : undefined}
                placeholder="Full street address"
                required
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <TextInput
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                color={errors.phone ? 'failure' : undefined}
                placeholder="(555) 123-4567"
                required
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <TextInput
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                color={errors.email ? 'failure' : undefined}
                placeholder="contact@restaurant.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <TextInput
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                color={errors.website ? 'failure' : undefined}
                placeholder="https://www.restaurant.com"
              />
              {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
            </div>

            <div>
              <Label htmlFor="hours">Operating Hours *</Label>
              <TextInput
                id="hours"
                type="text"
                value={formData.hours}
                onChange={(e) => handleInputChange('hours', e.target.value)}
                color={errors.hours ? 'failure' : undefined}
                placeholder="e.g., 11:00 AM - 10:00 PM"
                required
              />
              {errors.hours && <p className="text-red-500 text-sm mt-1">{errors.hours}</p>}
            </div>
          </div>
        </div>

        {/* Image URL */}
        <div>
          <Label htmlFor="image">Image URL</Label>
          <TextInput
            id="image"
            type="url"
            value={formData.image}
            onChange={(e) => handleInputChange('image', e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-gray-500 text-sm mt-1">Optional: URL to restaurant image</p>
        </div>

        {/* Features */}
        <div>
          <Label>Features</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
            {commonFeatures.map((feature) => (
              <label
                key={feature}
                className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={formData.features.includes(feature)}
                  onChange={() => toggleFeature(feature)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm">{feature}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <Button
            type="button"
            onClick={onCancel}
            color="light"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            color="success"
            disabled={submitting}
            className="flex items-center gap-2"
          >
            {submitting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <FaSave />
            {isEditing ? 'Update Restaurant' : 'Add Restaurant'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
