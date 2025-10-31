
import React from 'react';

const TechnicianLeaderboard = () => {
  // Mock data for the leaderboard
  const technicians = [
    { id: 1, name: 'John Doe', tasksCompleted: 25, avgTime: '2.5 hours', qualityScore: '95%' },
    { id: 2, name: 'Jane Smith', tasksCompleted: 22, avgTime: '2.8 hours', qualityScore: '92%' },
    { id: 3, name: 'Mike Johnson', tasksCompleted: 20, avgTime: '3.1 hours', qualityScore: '88%' },
    { id: 4, name: 'Emily Davis', tasksCompleted: 18, avgTime: '3.5 hours', qualityScore: '85%' },
    { id: 5, name: 'David Wilson', tasksCompleted: 15, avgTime: '4.0 hours', qualityScore: '80%' },
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Technician KPI Leaderboard</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Rank</th>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Tasks Completed</th>
              <th className="py-2 px-4 border-b">Avg. Time to Completion</th>
              <th className="py-2 px-4 border-b">Quality Score</th>
            </tr>
          </thead>
          <tbody>
            {technicians.map((tech, index) => (
              <tr key={tech.id}>
                <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                <td className="py-2 px-4 border-b">{tech.name}</td>
                <td className="py-2 px-4 border-b text-center">{tech.tasksCompleted}</td>
                <td className="py-2 px-4 border-b text-center">{tech.avgTime}</td>
                <td className="py-2 px-4 border-b text-center">{tech.qualityScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TechnicianLeaderboard;
