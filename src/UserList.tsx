import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Caricamento utenti
  useEffect(() => {
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
  }, []);

  // 🔹 Salvataggio modifiche
  const handleSave = () => {
    if (!selectedUser) return;

    // Validazione base
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

  if (loading) return <p>Caricamento...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <h2>Lista utenti</h2>

      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Cognome</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              onClick={() => setSelectedUser(user)}
              style={{ cursor: "pointer" }}
            >
              <td>{user.id}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {selectedUser && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Modifica utente</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedUser(null)}
                ></button>
              </div>

              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Nome</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedUser.firstName || ""}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, firstName: e.target.value })
                    }
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Cognome</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedUser.lastName || ""}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, lastName: e.target.value })
                    }
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={selectedUser.email || ""}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedUser(null)}
                >
                  Annulla
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  Salva
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