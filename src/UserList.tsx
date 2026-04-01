import { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { OverlayTrigger, Tooltip } from "react-bootstrap";

type User = {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
};

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = () => {
    fetch("http://localhost:8080/api/employees")
      .then(res => res.json())
      .then((data: User[]) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Errore:", err);
        setError("Impossibile caricare utenti");
        setLoading(false);
      });
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = () => {
    if (!selectedUser) return;
    if (!selectedUser.firstName || !selectedUser.lastName || !selectedUser.email) {
      alert("Compila tutti i campi!");
      return;
    }

    if (isNew) {
      fetch(`http://localhost:8080/api/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedUser),
      })
        .then(res => res.json())
        .then((createdUser: User) => {
          setUsers([...users, createdUser]);
          setSelectedUser(null);
        })
        .catch(err => console.error("Errore create:", err));
    } else {
      fetch(`http://localhost:8080/api/employees/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedUser),
      })
        .then(res => res.json())
        .then((updatedUser: User) => {
          setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
          setSelectedUser(null);
        })
        .catch(err => console.error("Errore update:", err));
    }
  };

  const handleDelete = (id?: number) => {
    if (!id) return;
    if (!window.confirm("Sei sicuro di voler eliminare questo utente?")) return;

    fetch(`http://localhost:8080/api/employees/${id}`, { method: "DELETE" })
      .then(() => setUsers(users.filter(u => u.id !== id)))
      .catch(err => console.error("Errore delete:", err));
  };

  if (loading) return <p>Caricamento...</p>;
  if (error) return <p>{error}</p>;

  const renderTooltip = (text: string) => (<Tooltip>{text}</Tooltip>);

  return (
    <div className="container mt-4">

      {/* Header: titolo + icona più visibile */}
      <div className="d-flex align-items-center mb-3">
        <h2 className="text-start mb-0">Lista utenti</h2>
        <OverlayTrigger placement="top" overlay={renderTooltip("Aggiungi nuovo utente")}>
          <i className="bi bi-person-plus fs-3 text-success ms-3" style={{ cursor: "pointer", transition: "transform 0.2s" }}
             onClick={() => { setSelectedUser({ firstName: "", lastName: "", email: "" }); setIsNew(true); }}
             onMouseOver={e => (e.currentTarget.style.transform = "scale(1.2)")}
             onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}>
          </i>
        </OverlayTrigger>
      </div>

      {/* Tabella */}
      <table className="table table-striped table-hover text-start table-responsive">
        <thead className="table-dark text-start">
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Cognome</th>
            <th>Email</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.email}</td>
              <td>
                <OverlayTrigger placement="top" overlay={renderTooltip("Modifica")}>
                  <i className="bi bi-pencil-square text-primary me-2" style={{ cursor: "pointer" }}
                     onClick={() => { setSelectedUser(user); setIsNew(false); }}></i>
                </OverlayTrigger>

                <OverlayTrigger placement="top" overlay={renderTooltip("Elimina")}>
                  <i className="bi bi-trash text-danger" style={{ cursor: "pointer" }}
                     onClick={() => handleDelete(user.id)}></i>
                </OverlayTrigger>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal centralizzato */}
      {selectedUser && (
        <div className="modal show d-block text-start" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content text-start shadow">
              <div className="modal-header bg-primary text-white text-start">
                <h5 className="modal-title">{isNew ? "Aggiungi utente" : "Modifica utente"}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedUser(null)}></button>
              </div>
              <div className="modal-body text-start">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Nome</label>
                  <input type="text" className="form-control" value={selectedUser.firstName}
                         onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}/>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Cognome</label>
                  <input type="text" className="form-control" value={selectedUser.lastName}
                         onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}/>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input type="email" className="form-control" value={selectedUser.email}
                         onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}/>
                </div>
              </div>
              <div className="modal-footer text-start">
                <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Annulla</button>
                <button className="btn btn-success d-flex align-items-center" onClick={handleSave}>
                  <i className="bi bi-check-lg me-1"></i> Salva
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default UserList;