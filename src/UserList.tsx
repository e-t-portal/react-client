import { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { OverlayTrigger, Tooltip, Toast, ToastContainer } from "react-bootstrap";

type User = {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
};

type ToastMessage = {
  id: number;
  type: "success" | "error";
  text: string;
};

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null); // nuovo stato per conferma

  const fetchUsers = () => {
    fetch("http://localhost:8080/api/employees")
      .then(res => res.json())
      .then((data: User[]) => { setUsers(data); setLoading(false); })
      .catch(err => { console.error("Errore:", err); setError("Impossibile caricare utenti"); setLoading(false); });
  };

  useEffect(() => { fetchUsers(); }, []);

  const addToast = (type: "success" | "error", text: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, text }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleSave = () => {
    if (!selectedUser) return;
    if (!selectedUser.firstName || !selectedUser.lastName || !selectedUser.email) {
      alert("Compila tutti i campi!");
      return;
    }

    const method = isNew ? "POST" : "PUT";
    const url = isNew
      ? "http://localhost:8080/api/employees"
      : `http://localhost:8080/api/employees/${selectedUser.id}`;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedUser),
    })
      .then(res => res.json())
      .then((user: User) => {
        if (isNew) setUsers([...users, user]);
        else setUsers(users.map(u => u.id === user.id ? user : u));
        setSelectedUser(null);
        addToast("success", isNew ? "Utente aggiunto con successo!" : "Utente modificato con successo!");
      })
      .catch(err => { console.error(err); addToast("error", "Errore durante il salvataggio!"); });
  };

  const confirmDelete = (user: User) => setUserToDelete(user);

  const handleDelete = () => {
    if (!userToDelete || !userToDelete.id) return;
    fetch(`http://localhost:8080/api/employees/${userToDelete.id}`, { method: "DELETE" })
      .then(() => {
        setUsers(users.filter(u => u.id !== userToDelete.id));
        addToast("success", "Utente eliminato con successo!");
        setUserToDelete(null);
      })
      .catch(err => { console.error(err); addToast("error", "Errore durante l'eliminazione!"); setUserToDelete(null); });
  };

  if (loading) return <p>Caricamento...</p>;
  if (error) return <p>{error}</p>;

  const renderTooltip = (text: string) => (<Tooltip>{text}</Tooltip>);

  return (
    <div className="container mt-4">

      {/* Header con icona + animata */}
      <div className="d-flex align-items-center mb-3">
        <h2 className="text-start mb-0">Lista utenti</h2>
        <OverlayTrigger placement="top" overlay={renderTooltip("Aggiungi nuovo utente")}>
          <i
            className="bi bi-person-plus-fill fs-2.5 text-success ms-2"
            style={{ cursor: "pointer", transition: "all 0.3s" }}
            onClick={() => { setSelectedUser({ firstName: "", lastName: "", email: "" }); setIsNew(true); }}
            onMouseOver={e => { e.currentTarget.style.transform = "scale(1.3)"; e.currentTarget.style.textShadow = "0 0 8px #28a745"; }}
            onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.textShadow = "none"; }}
          ></i>
        </OverlayTrigger>
      </div>

      {/* Tabella */}
      <div className="table-responsive shadow-sm">
        <table className="table table-hover text-start align-middle mb-0">
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
                    <i className="bi bi-pencil-square text-primary me-2"
                       style={{ cursor: "pointer", transition: "all 0.2s" }}
                       onMouseOver={e => e.currentTarget.style.transform = "scale(1.2)"}
                       onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                       onClick={() => { setSelectedUser(user); setIsNew(false); }}></i>
                  </OverlayTrigger>

                  <OverlayTrigger placement="top" overlay={renderTooltip("Elimina")}>
                    <i className="bi bi-trash text-danger"
                       style={{ cursor: "pointer", transition: "all 0.2s" }}
                       onMouseOver={e => e.currentTarget.style.transform = "scale(1.2)"}
                       onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                       onClick={() => confirmDelete(user)}></i>
                  </OverlayTrigger>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal aggiungi/modifica */}
      {selectedUser && (
        <div className="modal show d-block text-start" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content text-start shadow-lg">
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

      {/* Modal conferma eliminazione */}
      {userToDelete && (
        <div className="modal show d-block text-start" tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">Conferma eliminazione</h5>
                <button type="button" className="btn-close" onClick={() => setUserToDelete(null)}></button>
              </div>
              <div className="modal-body text-start">
                Sei sicuro di voler eliminare l'utente <strong>{userToDelete.firstName} {userToDelete.lastName}</strong>?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setUserToDelete(null)}>Annulla</button>
                <button className="btn btn-danger" onClick={handleDelete}>Elimina</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast container */}
      <ToastContainer position="top-end" className="p-3">
        {toasts.map(t => (
          <Toast key={t.id} bg={t.type === "success" ? "success" : "danger"} autohide delay={3000}>
            <Toast.Body className="d-flex align-items-center text-white">
              <i className={`bi ${t.type === "success" ? "bi-check-circle-fill" : "bi-x-circle-fill"} me-2 fs-5`}></i>
              {t.text}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>

    </div>
  );
}

export default UserList;