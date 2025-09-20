import React, { useEffect, useState, useMemo } from "react";
import { api, getUser } from "../api";
import { Link } from "react-router-dom";
import { FiPlus, FiBookOpen, FiSearch, FiX } from "react-icons/fi";
import Modal from "../components/Modal";

export default function Courses() {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Lexo rolin aktual
  const u = getUser();
  const isAdmin = useMemo(() => u?.role === "admin", [u]);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    const s = searchTerm.trim().toLowerCase();
    const filtered = subjects.filter((subject) =>
      subject.name.toLowerCase().includes(s) || subject.code.toLowerCase().includes(s)
    );
    setFilteredSubjects(filtered);
  }, [searchTerm, subjects]);

  const loadSubjects = () => {
    setIsLoading(true);
    setErrorMsg("");
    api
      .get("/courses")
      .then((r) => {
        setSubjects(r.data || []);
        setFilteredSubjects(r.data || []);
      })
      .catch((err) => {
        console.error("Gabim gjatë ngarkimit të lëndëve:", err);
        setErrorMsg("Nuk u ngarkuan lëndët. Provo përsëri.");
      })
      .finally(() => setIsLoading(false));
  };

  const createSubject = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Guard në front: vetëm admin
    if (!isAdmin) {
      setErrorMsg("Vetëm administratori mund të krijojë lëndë.");
      return;
    }

    try {
      await api.post("/courses", { name, code, description });
      setName("");
      setCode("");
      setDescription("");
      setIsModalOpen(false);
      loadSubjects();
    } catch (error) {
      console.error("Gabim gjatë krijimit të lëndës:", error);
      const status = error?.response?.status;
      if (status === 403) {
        setErrorMsg("Nuk keni të drejtë të krijoni lëndë.");
      } else if (status === 400) {
        setErrorMsg(error?.response?.data?.error || "Të dhënat nuk janë të plota.");
      } else {
        setErrorMsg("Diçka shkoi keq. Provo përsëri.");
      }
    }
  };

  const clearSearch = () => setSearchTerm("");

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Lëndët e Mia</h1>
          <p className="text-lg text-gray-600">Shiko dhe menaxho lëndët dhe detyrat e tua</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Kërko lëndë..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button onClick={clearSearch} className="text-gray-400 hover:text-gray-600">
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Butoni "Shto Lëndë" — vetëm për admin */}
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r cursor-pointer from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 flex items-center whitespace-nowrap transform hover:-translate-y-1"
            >
              <FiPlus className="mr-2" />
              Shto Lëndë të Re
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="max-w-7xl mx-auto mb-4">
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3">
              {errorMsg}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-gray-500">Duke ngarkuar lëndët...</div>
          </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <FiBookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nuk u gjetën lëndë</h3>
            <p className="mt-2 text-gray-500">
              {searchTerm ? "Provoni një term tjetër kërkimi" : "S’ka lëndë për momentin"}
            </p>
            {/* Butoni për krijim vetëm për admin edhe në empty-state */}
            {isAdmin && (
              <div className="mt-6">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiPlus className="mr-2" />
                  Shto Lëndë
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSubjects.map((subject) => (
              <Link
                // nese ke route /courses/:id, përdor këtë; ndryshe lëre /subjects/:id
                to={`/courses/${subject.id}`}
                key={subject.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 block"
              >
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <FiBookOpen className="text-2xl text-indigo-500" />
                    <span className="text-xs font-semibold px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                      {subject.code}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{subject.name}</h2>
                  {subject.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mt-3">{subject.description}</p>
                  )}
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Shiko detajet</span>
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Modal-i shfaqet vetëm kur je admin */}
        {isAdmin && (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Krijo Lëndë të Re</h3>
              </div>

              <form onSubmit={createSubject} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Emri i Lëndës</label>
                  <input
                    className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="p.sh. Prezantim i Programimit"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kodi i Lëndës</label>
                  <input
                    className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="p.sh. PR101"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Përshkrimi (opsional)</label>
                  <textarea
                    className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                    placeholder="Përshkruaj çfarë do të mësojnë studentët në këtë lëndë"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 cursor-pointer text-white px-4 py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-medium shadow-md hover:shadow-lg"
                >
                  Krijo Lëndën
                </button>
              </form>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
}