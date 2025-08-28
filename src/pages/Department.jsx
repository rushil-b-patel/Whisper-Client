import { useEffect, useState } from 'react';
import { usePostService } from '../context/PostContext';
import PostCard from '../ui/PostCard';

export default function Department() {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptPosts, setDeptPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { getPostsByDepartment, getDepartments } = usePostService();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await getDepartments();
        setDepartments(res.departments || []);
      } catch (err) {
        console.error('Failed to fetch departments', err);
      }
    };

    fetchDepartments();
  }, []);

  const fetchPosts = async (deptName) => {
    if (selectedDept === deptName) {
      setSelectedDept(null);
      setDeptPosts([]);
      return;
    }
    try {
      setLoading(true);
      const res = await getPostsByDepartment(deptName);
      setDeptPosts(res.posts || []);
      setSelectedDept(deptName);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-12">Explore Departments</h1>

        <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 mb-12">
          {departments.map((dept) => (
            <button
              key={dept.name}
              onClick={() => fetchPosts(dept.name)}
              className={`rounded-2xl border dark:border-[#2A2B30] px-4 py-6 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm text-center ${
                selectedDept === dept.name
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-white dark:bg-[#1a1c1f]'
              }`}
            >
              <h3 className="text-lg font-bold">{dept.name}</h3>
              <p className="text-gray-500 dark:text-gray-400">{dept.postCount} posts</p>
            </button>
          ))}
        </div>

        {selectedDept && (
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-[#2A2B30] shadow-md bg-white dark:bg-[#0e1113] transition-all">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">
              Posts from <span className="underline">{selectedDept}</span>
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-10">
                <span className="animate-spin h-8 w-8 border-2 border-black dark:border-white border-t-transparent rounded-full"></span>
              </div>
            ) : deptPosts.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No posts found in this department.</p>
            ) : (
              <div className="space-y-6">
                {deptPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
