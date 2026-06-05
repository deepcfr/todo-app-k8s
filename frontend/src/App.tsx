import { useState, useEffect } from "react";

// const API = import.meta.env.VITE_API_URL || "http://localhost:8080";
const API = "http://localhost:8080";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetch(`${API}/todos`)
      .then((r) => r.json())
      .then(setTodos);
  }, []);

  const add = async () => {
    if (!text.trim()) return;
    const res = await fetch(`${API}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const todo = await res.json();
    setTodos([todo, ...todos]);
    setText("");
  };

  const remove = async (id: number) => {
    await fetch(`${API}/todos/${id}`, { method: "DELETE" });
    setTodos(todos.filter((t) => t.id !== id));
  };

  const toggle = async (todo: Todo) => {
    const res = await fetch(`${API}/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !todo.done }),
    });
    const updated = await res.json();
    setTodos(todos.map((t) => (t.id === updated.id ? updated : t)));
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (id: number) => {
    if (!editText.trim()) return;
    const res = await fetch(`${API}/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editText }),
    });
    const updated = await res.json();
    setTodos(todos.map((t) => (t.id === updated.id ? updated : t)));
    cancelEdit();
  };

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .heading { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-stone-50 flex items-start justify-center pt-16 px-4 pb-8">
        <div className="w-full max-w-md">
          {/* header */}
          <div className="mb-8">
            <h1 className="heading text-4xl tracking-tighter text-stone-950 font-semibold">
              todos.
            </h1>
            <p className="text-stone-500 text-sm mt-1 font-medium">
              {remaining === 0 ? "all done" : `${remaining} left`}
            </p>
          </div>

          {/* input */}
          <div className="flex gap-2 mb-6">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="what needs to be done?"
              className="flex-1 bg-white border border-stone-300 rounded-lg px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none focus:border-stone-700 focus:ring-2 focus:ring-stone-300 transition"
            />
            <button
              onClick={add}
              className="bg-stone-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold border border-stone-900 hover:bg-stone-800 transition cursor-pointer"
            >
              Add
            </button>
          </div>

          {/* list */}
          <div className="space-y-2">
            {todos.length === 0 && (
              <p className="text-stone-500 text-sm text-center py-10 font-medium">
                nothing here yet
              </p>
            )}
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 bg-white border border-stone-300 rounded-lg px-4 py-3 group hover:border-stone-400 transition-colors"
              >
                {/* checkbox */}
                <button
                  onClick={() => toggle(todo)}
                  aria-label={
                    todo.done ? "Mark as incomplete" : "Mark as complete"
                  }
                  className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                    todo.done
                      ? "bg-stone-900 border-stone-900"
                      : "bg-white border-stone-500 hover:border-stone-700"
                  }`}
                >
                  {todo.done && (
                    <svg
                      viewBox="0 0 20 20"
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 10.5l4 4 8-9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>

                {/* text */}
                <div className="flex-1">
                  {editingId === todo.id ? (
                    <input
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(todo.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="w-full bg-white border border-stone-300 rounded px-2 py-1 text-sm"
                    />
                  ) : (
                    <span
                      onClick={() => toggle(todo)}
                      onDoubleClick={() => startEdit(todo)}
                      className={`flex-1 text-sm cursor-pointer transition-colors select-none ${
                        todo.done ? "line-through text-stone-500" : "text-stone-900"
                      }`}
                    >
                      {todo.text}
                    </span>
                  )}
                </div>

                {/* delete */}
                <div className="flex items-center gap-3">
                  {editingId === todo.id ? (
                    <>
                      <button
                        onClick={() => saveEdit(todo.id)}
                        className="text-stone-900 text-xs font-medium mr-2 cursor-pointer"
                      >
                        save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-stone-500 hover:text-stone-700 text-xs font-medium cursor-pointer"
                      >
                        cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(todo)}
                        className="text-stone-500 hover:text-stone-700 transition-colors opacity-70 group-hover:opacity-100 text-xs font-medium cursor-pointer mr-2"
                      >
                        edit
                      </button>
                      <button
                        onClick={() => remove(todo.id)}
                        className="text-stone-500 hover:text-red-600 transition-colors opacity-70 group-hover:opacity-100 text-xs font-medium cursor-pointer"
                      >
                        delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
