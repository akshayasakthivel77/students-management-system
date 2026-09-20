import StudentForm from '../components/StudentForm';

export default function AddStudent() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Add Student</h1>
          <p>Fill in the details to register a new student.</p>
        </div>
      </div>
      <div className="card" style={{ maxWidth: '800px' }}>
        <StudentForm />
      </div>
    </div>
  );
}
