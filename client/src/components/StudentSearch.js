import React, { useState } from 'react';

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const StudentSearch = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    const searchQuery = String(query || '').trim();
    if (!searchQuery) {
      setError('Please enter a search query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const response = await fetch('http://localhost:5000/api/student/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process search');
      }

      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
      const errorMessage = err.message.includes('Failed to fetch') 
        ? 'Unable to connect to the server. Please check your connection.'
        : err.message;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStudentsTable = () => {
    if (!searchResults?.similar_students || searchResults.similar_students.length === 0) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 font-medium">No matching students found</p>
          <p className="text-gray-500 text-sm mt-2">Try a different search query</p>
        </div>
      );
    }

    return (
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interests
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Match Score
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {searchResults.similar_students.map((student, index) => (
              <tr 
                key={student._id} 
                className={`hover:bg-gray-50 transition-colors ${index === 0 ? 'bg-blue-50' : ''}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {student.studentName?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {student.studentName || 'N/A'}
                      </div>
                      {index === 0 && (
                        <div className="text-xs text-blue-600 font-medium">
                          Best Match
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.emailID || 'N/A'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {student.interests && student.interests.length > 0 ? (
                      student.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No interests listed</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16">
                      <div className="text-sm font-medium text-gray-900">
                        {(student.similarity_score * 100).toFixed(1)}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${student.similarity_score * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Student Search</h2>
        <p className="text-gray-600 text-sm mt-1">Find students by skills, experience, or interests</p>
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search for students (e.g., 'Mobile App Development with DevOps experience')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Searching...
              </>
            ) : (
              <>
                <SearchIcon />
                Search
              </>
            )}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Try: "web developers with React experience" or "Mobile App Development"
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 mt-4">Analyzing and finding best matches...</p>
        </div>
      ) : searchResults ? (
        <div className="mt-6 space-y-6">
          {/* Search Query Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Search Query Analysis</h3>
            <div className="text-sm text-blue-800">
              <p><strong>Query:</strong> {query}</p>
              {searchResults.llm_response && (
                <div className="mt-2 space-y-1">
                  {searchResults.llm_response.skills && searchResults.llm_response.skills.length > 0 && (
                    <p><strong>Skills Detected:</strong> {searchResults.llm_response.skills.join(', ')}</p>
                  )}
                  {searchResults.llm_response.experienceLevel && (
                    <p><strong>Experience Level:</strong> {searchResults.llm_response.experienceLevel}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Results Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Top {searchResults.total_matches} Matching Students
              </h3>
              {searchResults.total_matches > 0 && (
                <span className="text-sm text-gray-500">
                  Sorted by relevance
                </span>
              )}
            </div>
            {renderStudentsTable()}
          </div>

          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Show raw response (debug)
              </summary>
              <div className="mt-2 bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
                <pre className="text-green-400 text-sm font-mono">
                  {JSON.stringify(searchResults, null, 2)}
                </pre>
              </div>
            </details>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default StudentSearch;