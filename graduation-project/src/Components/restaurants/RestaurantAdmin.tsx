import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaFilter } from 'react-icons/fa';
import { Card, Button, Badge, Spinner, TextInput } from 'flowbite-react';
import { getAllRestaurants, deleteRestaurant } from '../../services/restaurant';
import type { ReturnRestaurantQuery, ReturnRestaurantQueryPagination } from '../../types/restaurant';
import { useAuth } from '../../contexts/AuthContext';
import RestaurantForm from './RestaurantForm';

export default function RestaurantAdmin() {
  const [restaurants, setRestaurants] = useState<ReturnRestaurantQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<ReturnRestaurantQuery | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<ReturnRestaurantQueryPagination | null>(null);
  const { user } = useAuth();

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllRestaurants(1, 100); // Get all restaurants for admin
      setRestaurants(response.restaurants);
      setPagination(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleAddRestaurant = () => {
    setSelectedRestaurant(null);
    setShowForm(true);
  };

  const handleEditRestaurant = (restaurant: ReturnRestaurantQuery) => {
    setSelectedRestaurant(restaurant);
    setShowForm(true);
  };

  const handleSaveRestaurant = async (_restaurant: ReturnRestaurantQuery) => {
    await fetchRestaurants();
    setShowForm(false);
    setSelectedRestaurant(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedRestaurant(null);
  };

  const handleDeleteRestaurant = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteRestaurant(id);
      await fetchRestaurants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete restaurant');
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAdminUser = user && (user.email.includes('admin') || user.email.includes('owner'));

  if (!isAdminUser) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">Access Denied</div>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">{error}</div>
        <Button onClick={fetchRestaurants} color="failure">
          Try Again
        </Button>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Button
            onClick={handleCancelForm}
            color="light"
            className="mb-4"
          >
            ← Back to Restaurant List
          </Button>
        </div>
        <RestaurantForm
          restaurant={selectedRestaurant || undefined}
          onSave={handleSaveRestaurant}
          onCancel={handleCancelForm}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Management</h1>
          <p className="text-gray-600 mt-1">
            {pagination ? `Managing ${pagination.totalCount} restaurants` : 'Loading restaurants...'}
          </p>
        </div>
        <Button
          onClick={handleAddRestaurant}
          color="success"
          className="flex items-center gap-2"
        >
          <FaPlus />
          Add New Restaurant
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <TextInput
              type="text"
              placeholder="Search restaurants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <FaFilter />
            <span className="text-sm">
              {filteredRestaurants.length} of {restaurants.length} results
            </span>
          </div>
        </div>
      </Card>

      {/* Restaurant Grid */}
      {filteredRestaurants.length === 0 ? (
        <Card className="text-center py-12">
          <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No restaurants found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Restaurant Header */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                {restaurant.image && (
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div className="absolute top-3 left-3">
                  <Badge color={restaurant.isActive ? 'success' : 'warning'} className="bg-emerald-600">
                    {restaurant.cuisine}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge color={restaurant.isActive ? 'light' : 'failure'}>
                    {restaurant.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {/* Restaurant Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-gray-700">
                      ⭐ {restaurant.rating}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({restaurant.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {restaurant.description}
                </p>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">📍</span>
                    <span>{restaurant.location}</span>
                    <Badge color="light" className="ml-auto">
                      {restaurant.priceRange}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium">📞</span>
                    <span>{restaurant.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium">🕐</span>
                    <span>{restaurant.hours}</span>
                  </div>
                </div>

                {/* Features */}
                {restaurant.features.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {restaurant.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} color="light" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {restaurant.features.length > 3 && (
                      <Badge color="light" className="text-xs">
                        +{restaurant.features.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button
                    color="light"
                    size="sm"
                    onClick={() => window.open(`/restaurants/${restaurant.id}`, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <FaEye />
                    View
                  </Button>
                  <Button
                    color="warning"
                    size="sm"
                    onClick={() => handleEditRestaurant(restaurant)}
                    className="flex items-center gap-1"
                  >
                    <FaEdit />
                    Edit
                  </Button>
                  <Button
                    color="failure"
                    size="sm"
                    onClick={() => handleDeleteRestaurant(restaurant.id, restaurant.name)}
                    className="flex items-center gap-1"
                  >
                    <FaTrash />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      {pagination && (
        <Card className="mt-8 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{pagination.totalCount}</div>
              <div className="text-sm text-gray-500">Total Restaurants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {restaurants.filter(r => r.isActive).length}
              </div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {restaurants.filter(r => !r.isActive).length}
              </div>
              <div className="text-sm text-gray-500">Inactive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(restaurants.reduce((sum, r) => sum + r.rating, 0) / restaurants.length * 10) / 10}
              </div>
              <div className="text-sm text-gray-500">Avg Rating</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
