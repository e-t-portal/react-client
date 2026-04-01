import { useEffect, useState } from "react";

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 🔹 GET utenti
  useEffect(() => {
    fetch("http://localhost:8080/api/employees")
      .then((res) => res.json())
      .then((data: User[]) => setUsers(data))
      .catch((err) => console.error("Errore:", err));
  }, []);

  // 🔹 PUT update
  const handleSave = () => {
    if (!selectedUser) return;

    fetch(`http://localhost:8080/api/employees/${selectedUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedUser),
    })
      .then((res) => res.json())
      .then((updatedUser: User) => {
        setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
        setSelectedUser(null);
      })
      .catch((err) => console.error("Errore update:", err));
  };

  return (
    <div>
      <h2>Lista utenti</h2>

      <table border={1}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Cognome</th>
            <th>Email</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id} onClick={() => setSelectedUser(user)}>
              <td>{user.id}</td>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 MODAL */}
      {selectedUser && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modifica utente</h5>
                <button className="btn-close" onClick={() => setSelectedUser(null)}></button>
              </div>
              <div className="modal-body">
                <input
                  value={selectedUser.firstName || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, firstName: e.target.value })
                  }
                  placeholder="Nome"
                />
                <input
                  value={selectedUser.lastName || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, lastName: e.target.value })
                  }
                  placeholder="Cognome"
                />
                <input
                  value={selectedUser.email || ""}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                  placeholder="Email"
                />
              </div>
              <div className="modal-footer">
                <button onClick={() => setSelectedUser(null)}>Annulla</button>
                <button onClick={handleSave}>Salva</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;