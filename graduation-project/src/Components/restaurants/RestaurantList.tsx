import { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaStar, FaMapMarkerAlt, FaPhone, FaClock, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Card, Button, Badge, TextInput, Spinner } from 'flowbite-react';
import { getAllRestaurants, deleteRestaurant } from '../../services/restaurant';
import type { ReturnRestaurantQuery, ReturnRestaurantQueryPagination } from '../../types/restaurant';
import { useAuth } from '../../contexts/AuthContext';

interface RestaurantListProps {
  isAdmin?: boolean;
  onEditRestaurant?: (restaurant: ReturnRestaurantQuery) => void;
  onAddRestaurant?: () => void;
}

export default function RestaurantList({ isAdmin = false, onEditRestaurant, onAddRestaurant }: RestaurantListProps) {
  const [restaurants, setRestaurants] = useState<ReturnRestaurantQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<ReturnRestaurantQueryPagination | null>(null);
  const { user } = useAuth();

  const pageSize = 12;

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllRestaurants(currentPage, pageSize);
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
  }, [currentPage]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(restaurant => {
      const matchesSearch = searchTerm === '' || 
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCuisine = cuisineFilter === 'all' || restaurant.cuisine === cuisineFilter;
      const matchesPrice = priceFilter === 'all' || restaurant.priceRange === priceFilter;

      return matchesSearch && matchesCuisine && matchesPrice;
    });
  }, [restaurants, searchTerm, cuisineFilter, priceFilter]);

  const handleDeleteRestaurant = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteRestaurant(id);
      await fetchRestaurants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete restaurant');
    }
  };

  const uniqueCuisines = useMemo(() => {
    const cuisines = new Set(restaurants.map(r => r.cuisine));
    return Array.from(cuisines).sort();
  }, [restaurants]);

  const uniquePriceRanges = useMemo(() => {
    const prices = new Set(restaurants.map(r => r.priceRange));
    return Array.from(prices).sort();
  }, [restaurants]);

  const isAdminUser = user && (user.email.includes('admin') || isAdmin);

  if (loading && restaurants.length === 0) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurants</h1>
          <p className="text-gray-600 mt-1">
            {pagination ? `Showing ${pagination.totalCount} restaurants` : 'Loading...'}
          </p>
        </div>
        {isAdminUser && onAddRestaurant && (
          <Button onClick={onAddRestaurant} color="success" className="flex items-center gap-2">
            <FaPlus />
            Add Restaurant
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <TextInput
                type="text"
                placeholder="Search restaurants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Cuisine Filter */}
          <select
            value={cuisineFilter}
            onChange={(e) => setCuisineFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">All Cuisines</option>
            {uniqueCuisines.map(cuisine => (
              <option key={cuisine} value={cuisine}>{cuisine}</option>
            ))}
          </select>

          {/* Price Filter */}
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">All Prices</option>
            {uniquePriceRanges.map(price => (
              <option key={price} value={price}>{price}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Restaurant Grid */}
      {filteredRestaurants.length === 0 ? (
        <Card className="text-center py-12">
          <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No restaurants found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Restaurant Image */}
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
                  <Badge color="success" className="bg-emerald-600">
                    {restaurant.cuisine}
                  </Badge>
                </div>
                {isAdminUser && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      size="xs"
                      color="warning"
                      onClick={() => onEditRestaurant?.(restaurant)}
                      className="!p-2"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      size="xs"
                      color="failure"
                      onClick={() => handleDeleteRestaurant(restaurant.id, restaurant.name)}
                      className="!p-2"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                )}
              </div>

              {/* Restaurant Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400 text-sm" />
                    <span className="text-sm font-medium text-gray-700">
                      {restaurant.rating}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({restaurant.reviewCount})
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                  {restaurant.description}
                </p>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-emerald-600" />
                    <span>{restaurant.location}</span>
                    <Badge color="light" className="ml-auto">
                      {restaurant.priceRange}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-emerald-600" />
                    <span>{restaurant.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FaClock className="text-emerald-600" />
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

                {/* Action Button */}
                <Button
                  color="success"
                  className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                  onClick={() => {
                    // Navigate to restaurant details - will implement later
                    window.location.href = `/restaurants/${restaurant.id}`;
                  }}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            color="light"
            size="sm"
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {pagination.totalPages}
          </span>
          
          <Button
            disabled={currentPage === pagination.totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            color="light"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
