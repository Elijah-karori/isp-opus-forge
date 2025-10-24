import { AttendanceTracker } from '../components/technicians/AttendanceTracker';
import { TechnicianPerformance } from '../components/technicians/TechnicianPerformance';

const TechnicianTools = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Technician Tools</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Attendance Tracker</h2>
          <AttendanceTracker />
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Technician Performance</h2>
          <TechnicianPerformance />
        </div>
      </div>
    </div>
  );
};

export default TechnicianTools;
