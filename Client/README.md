# VeriFIR 🔍⚖️

This is the frontend for the FIR Classifier project, built using **React.js** and **Tailwind CSS**. It allows users to file a textual complaint and get predicted IPC Sections using a Flask-based backend with an NLP model.

---

## 💡 Features

- Clean and responsive UI using Tailwind CSS
- Textarea to file complaints
- Submits complaints to the backend via `GET` request
- Displays predicted IPC sections dynamically
- Easy integration with any Flask API

---

## 📦 Tech Stack

- [React.js](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Flask (Backend)](https://flask.palletsprojects.com/) (for serving the model)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/fir-classifier-frontend.git
cd fir-classifier-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The app should now be running on [http://localhost:5173](http://localhost:5173)

---

## 🔗 Backend Integration

Make sure your Flask backend is running on `http://127.0.0.1:5000`.

The main API endpoint expected:

```
GET /predict?IPC_Section_Text=<your complaint>
```

This is already configured in the fetch request in the `Form.jsx` component.

---

<!-- ## 🖼️ UI Preview

_A -->

```
📂 Project Directory:
├── src
│   ├── components
│   │   └── Form.jsx
│   ├── App.jsx
│   └── main.jsx
├── public
├── tailwind.config.js
└── README.md
```

---

## 🧠 Future Improvements

- Enable file upload and IPC section prediction from documents

---

## 🛡️ License

MIT © 2025 — [Your Name]
