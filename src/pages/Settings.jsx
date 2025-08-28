import { useEffect, useState } from 'react';
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { useAuth } from '../context/AuthContext';
import { usePostService } from '../context/PostContext';

function Settings() {
  const { user, updateUserData, isLoading } = useAuth();
  const { getDepartments, saveDepartment } = usePostService();
  const [userName, setUserName] = useState(user?.userName || user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [departments, setDepartments] = useState([]);
  const [query, setQuery] = useState('');

  const filtered =
    query.trim() === ''
      ? departments
      : departments.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => {
    const _fetchDepartments = async () => {
      const data = await getDepartments();
      setDepartments(data.departments || []);
    };
    _fetchDepartments();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    let finalDept = department.trim();

    if (finalDept) {
      const exists = departments.find((d) => d.name.toLowerCase() === finalDept.toLowerCase());

      if (!exists) {
        const res = await saveDepartment(finalDept);
        setDepartments((prev) => {
          if (prev.some((d) => d._id === res.data.department._id)) return prev;
          return [...prev, res.data.department];
        });
      }
    }
    await updateUserData({ userName: userName.trim(), department: finalDept, bio: bio.trim() });
  };

  return (
    <div className="min-h-[calc(100vh-4em)] px-4 sm:px-6 py-10 flex justify-center">
      <div className="w-full max-w-2xl border border-gray-200 dark:border-neutral-800 rounded-lg px-6 py-8 sm:px-10 sm:py-12 transition-all duration-300 shadow-sm">
        <h1 className="text-3xl sm:text-4xl font-bold mb-10 border-l-4 pl-4 border-black dark:border-white">
          Edit Profile
        </h1>

        <form onSubmit={handleSave} className="space-y-10">
          <div>
            <label htmlFor="username" className="block font-semibold mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your username"
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 text-black dark:text-white p-2 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block font-semibold mb-2">
              About You
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself"
              rows={3}
              className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 text-black dark:text-white p-2 resize-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <label htmlFor="department" className="block font-semibold mb-2">
              Department
            </label>
            <Combobox value={department} onChange={setDepartment}>
              <div className="relative">
                <ComboboxInput
                  id="department"
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setDepartment(e.target.value);
                  }}
                  className="w-full border-b border-gray-300 dark:border-gray-700 p-2 bg-transparent text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  placeholder="Select or type your department"
                />
                <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 text-black dark:text-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-sm">
                  {filtered.length > 0 ? (
                    filtered.map((dept) => (
                      <ComboboxOption
                        key={dept._id}
                        value={dept.name}
                        className={({ active }) =>
                          `cursor-pointer select-none px-4 py-2 ${
                            active ? 'bg-gray-500 text-white' : ''
                          }`
                        }
                      >
                        {dept.name}
                      </ComboboxOption>
                    ))
                  ) : (
                    <div className="cursor-default select-none px-4 py-2 text-gray-500 dark:text-gray-400">
                      No results found. Press Enter to add "{query}".
                    </div>
                  )}
                </ComboboxOptions>
              </div>
            </Combobox>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 font-semibold bg-black text-white hover:bg-white hover:text-black border border-black transition-all duration-300 rounded focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            Your email is encrypted and stored securely.
          </p>
        </form>
      </div>
    </div>
  );
}

export default Settings;
