import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { OverlayTrigger, Tooltip } from "react-bootstrap"; //


type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<User>({ id: 0, firstName: "", lastName: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = () => {
    fetch("http://localhost:8080/api/employees")
      .then((res) => res.json())
      .then((data: User[]) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
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

    fetch(`http://localhost:8080/api/employees/${selectedUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedUser),
    })
      .then((res) => res.json())
      .then((updatedUser: User) => {
        setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
        setSelectedUser(null);
      })
      .catch((err) => console.error("Errore update:", err));
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo utente?")) return;

    fetch(`http://localhost:8080/api/employees/${id}`, { method: "DELETE" })
      .then(() => setUsers(users.filter((u) => u.id !== id)))
      .catch((err) => console.error("Errore delete:", err));
  };

  const handleAdd = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      alert("Compila tutti i campi!");
      return;
    }

    fetch(`http://localhost:8080/api/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    })
      .then((res) => res.json())
      .then((createdUser: User) => {
        setUsers([...users, createdUser]);
        setNewUser({ id: 0, firstName: "", lastName: "", email: "" });
      })
      .catch((err) => console.error("Errore create:", err));
  };

  if (loading) return <p>Caricamento...</p>;
  if (error) return <p>{error}</p>;

  // 🔹 Helper tooltip
  const renderTooltip = (text: string) => (
    <Tooltip id="button-tooltip">{text}</Tooltip>
  );

  return (
    <div className="container mt-4">
      <h2>Lista utenti</h2>

      {/* Form nuovo utente */}
      <div className="mb-3 p-3 border rounded">
        <h5>Aggiungi nuovo utente</h5>
        <div className="row g-2">
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Nome"
              value={newUser.firstName}
              onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
            />
          </div>
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Cognome"
              value={newUser.lastName}
              onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
            />
          </div>
          <div className="col">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div className="col-auto">
            <OverlayTrigger
              placement="top"
              overlay={renderTooltip("Aggiungi utente")}
            >
              <button className="btn btn-success">
                <i className="bi bi-plus-lg"></i>
              </button>
            </OverlayTrigger>
          </div>
        </div>
      </div>

      {/* Tabella */}
      <table className="table table-striped table-hover text-start">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Cognome</th>
            <th>Email</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.email}</td>
              <td>
                <OverlayTrigger
                  placement="top"
                  overlay={renderTooltip("Modifica")}
                >
                  <i
                    className="bi bi-pencil-square text-primary me-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedUser(user)}
                  ></i>
                </OverlayTrigger>

                <OverlayTrigger
                  placement="top"
                  overlay={renderTooltip("Elimina")}
                >
                  <i
                    className="bi bi-trash text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDelete(user.id)}
                  ></i>
                </OverlayTrigger>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal modifica */}
      {selectedUser && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Modifica utente</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedUser(null)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Nome</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedUser.firstName || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Cognome</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedUser.lastName || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })}
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={selectedUser.email || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Annulla</button>
                <button className="btn btn-primary" onClick={handleSave}>Salva</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;