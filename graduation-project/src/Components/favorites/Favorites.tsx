import { useAuth } from '../../contexts/AuthContext';

const Favorites = () => {
  const { user } = useAuth();

  const mockFavorites = [
    { id: 1, name: 'Cozy Cafe', rating: 4.5, cuisine: 'Cafe' },
    { id: 2, name: 'Urban Bistro', rating: 4.8, cuisine: 'Italian' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
      {user ? (
        <div className="grid gap-4 md:grid-cols-2">
          {mockFavorites.map((fav) => (
            <div key={fav.id} className="p-6 bg-white border rounded-lg shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold">{fav.name}</h3>
              <p>Rating: {fav.rating}/5 | {fav.cuisine}</p>
              <button className="mt-4 px-4 py-2 bg-[#6B8A62] text-white rounded hover:bg-[#5A7352]">
                Reserve Now
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">Please log in to view your favorites.</p>
      )}
    </div>
  );
};

export default Favorites;

