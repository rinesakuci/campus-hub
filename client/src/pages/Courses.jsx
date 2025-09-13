import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Link } from "react-router-dom";
import { FiPlus, FiBookOpen } from "react-icons/fi";
import Modal from "../components/Modal";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    api.get("/courses").then(r => setCourses(r.data));
  };

  const createCourse = async (e) => {
    e.preventDefault();
    await api.post("/courses", { name, code, description });
    setName(""); setCode(""); setDescription("");
    setIsModalOpen(false);
    loadCourses();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Courses</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-purple-700 transition duration-300 flex items-center"
        >
          <FiPlus className="mr-2" />
          Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <FiBookOpen className="text-4xl text-purple-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">{course.name}</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">{course.code}</p>
            {course.description && (
              <p className="text-gray-600 mt-3 line-clamp-3">{course.description}</p>
            )}
            <Link
              to={`/courses/${course.id}`}
              className="mt-4 inline-block text-purple-600 hover:text-purple-800 font-semibold transition-colors duration-300"
            >
              View Details →
            </Link>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={createCourse} className="space-y-4">
          <h3 className="text-2xl font-semibold mb-2">Create New Course</h3>
          <input
            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            placeholder="Course Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            placeholder="Course Code"
            value={code}
            onChange={e => setCode(e.target.value)}
            required
          />
          <textarea
            className="w-full border-2 border-gray-200 p-3 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows="4"
          />
          <button
            type="submit"
            className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition duration-300"
          >
            Create Course
          </button>
        </form>
      </Modal>
    </div>
  );
}