# Mental-Health-Score
# 🌷 MindBalance

### A gentle snapshot of the habits that shape your everyday balance.

**MindBalance** is a machine learning powered web application that generates a lifestyle-based mental wellness score from everyday behavioral and lifestyle inputs.

The core of the project is a **machine learning model developed in Python using Scikit-learn**. The project covers the complete machine learning workflow, from data exploration and preprocessing to feature engineering, model training, evaluation, and model serialization.

The trained model is integrated with a **FastAPI backend**, which receives the user's lifestyle inputs and returns a prediction to the frontend.

The frontend then turns the prediction into a simple and approachable experience through an interactive **balance wheel, score display, and Cici, a virtual wellness companion.**

---

## 🌿 What is MindBalance?

MindBalance takes information about everyday lifestyle patterns, such as:

- 😴 Sleep
- 📚 Study hours
- 🏃 Physical activity
- 📱 Screen time
- 📲 Phone usage
- 🌿 Stress level
- Other lifestyle-related information

and uses the trained machine learning model to generate a **balance score out of 10**.

The purpose of MindBalance is to turn a machine learning prediction into a visual and approachable experience that encourages users to reflect on their everyday habits.

> **Note:** The score is a lifestyle-based estimate generated from the information provided by the user. It is not a clinical or medical assessment.

---

## 🧠 Machine Learning

The main component of MindBalance is the machine learning model developed as part of this project.

The complete ML workflow includes:

- Data exploration and analysis
- Data cleaning and preprocessing
- Feature engineering
- Encoding and transformation of features
- Train-test splitting
- Model training
- Model evaluation
- Model serialization
- Integration of the trained model into a FastAPI backend

### ML Pipeline

```text
Dataset
   ↓
Data Exploration & Visualization
   ↓
Data Cleaning
   ↓
Feature Engineering
   ↓
Data Preprocessing
   ↓
Train / Test Split
   ↓
Model Training
   ↓
Model Evaluation
   ↓
Model Serialization
   ↓
FastAPI Integration
   ↓
User Prediction
```

The machine learning work was developed in ML_project.ipynb.

The final trained model is stored as:

Mental_Health_Model.pkl

The serialized model is loaded by the FastAPI backend and used to generate predictions from user inputs.

Users do not need to retrain the model or perform the preprocessing themselves to use the deployed application.

⚙️ How the Application Works

MindBalance connects the machine learning model, backend, and frontend into one complete application.

        User enters lifestyle information
                       ↓
                Frontend collects data
                       ↓
                 FastAPI API
                       ↓
              Trained ML Model
                       ↓
               Prediction Score
                       ↓
          ┌────────────┴────────────┐
          ↓                         ↓
    Balance Wheel                  Cici
          ↓                         ↓
   Visual representation      Gentle feedback

The frontend sends the user's inputs to the FastAPI backend through the prediction endpoint.

The backend loads the trained machine learning model, processes the incoming data in the required format, and returns the prediction.

The frontend then displays the result as a score out of 10 along with the visual balance wheel and Cici's feedback.

🌷 Meet Cici

Cici is MindBalance's virtual wellness companion.

She was designed to make the prediction feel more personal rather than presenting the user with only a numerical result.

Cici provides gentle feedback based on the user's result and lifestyle patterns.

Her design is intentionally:

Calm
Friendly
Encouraging
Simple
Non-judgmental

Cici is part of the user experience built around the machine learning prediction.

📊 Interactive Balance Wheel

MindBalance includes an interactive balance wheel that provides a visual representation of different areas of the user's lifestyle.

The wheel responds to the information entered by the user and complements the final machine learning prediction.

This allows users to understand their result visually instead of relying only on a numerical score.

🛠️ Tech Stack:-

🧠 Machine Learning & Data
Python - Main programming language
NumPy - Numerical operations
Pandas - Data manipulation and analysis
Matplotlib - Data visualization and exploratory analysis
Scikit-learn - Data preprocessing, feature engineering, model training and evaluation
Joblib - Model serialization and loading

⚡ Backend
FastAPI - API framework for serving the trained ML model
Pydantic - Request data validation
Uvicorn - ASGI server for running the FastAPI application

🎨 Frontend
HTML
CSS
JavaScript
SVG

🚀 Deployment & Development
Render - Backend deployment
GitHub - Version control and source code
VS Code - Development environment


## 📁 Project Structure

```text
Mental-Health-Score/
│
├── assets/
├── ML_project.ipynb
├── Mental_Health_Model.pkl
├── main.py
├── index.html
├── script.js
├── style.css
├── requirements.txt
└── README.md
```

| File | Purpose |
|---|---|
| `ML_project.ipynb` | Data analysis, preprocessing, feature engineering, model training and evaluation |
| `Mental_Health_Model.pkl` | Trained machine learning model |
| `main.py` | FastAPI backend and prediction endpoint |
| `index.html` | Frontend structure |
| `script.js` | Frontend logic and API communication |
| `style.css` | UI styling and responsive design |
| `requirements.txt` | Python dependencies |
| `assets/` | Cici and other visual assets |
    

## 🔌 Backend & API

The FastAPI backend connects the frontend with the trained machine learning model.

### Prediction Flow

```text
User Input
    ↓
Frontend
    ↓
POST /predict
    ↓
FastAPI
    ↓
Input Validation
    ↓
Trained ML Model
    ↓
Prediction
    ↓
Frontend Result
```

The backend receives the user's lifestyle information through the `/predict` endpoint.

Pydantic is used to validate the incoming data, while the trained machine learning model generates the prediction.

The returned prediction is then sent back to the frontend and displayed as the user's balance score.

📈 What I Worked On:-

This project involved both the machine learning development and the deployment of the model as a usable application.

1.Machine Learning

-Explored and analyzed the dataset
-Cleaned and prepared the data
-Performed feature engineering
-Preprocessed numerical and categorical features
-Split the data for model development and evaluation
-Trained and evaluated the machine learning model
-Saved the final trained model using Joblib/Pickle

2.Backend

-Built a FastAPI backend
-Created the prediction API
-Connected the trained model to the API
-Added input validation using Pydantic
-Prepared the backend for deployment

3.Frontend

-Designed the MindBalance interface
-Created the lifestyle input form
-Built the interactive balance wheel
-Added the score visualization
-Integrated the frontend with the FastAPI API
-Added Cici as a virtual wellness companion
-Made the interface responsive for different screen sizes

4.Deployment

-Connected the project with GitHub
-Deployed the FastAPI application using Render
-Connected the deployed frontend with the prediction API

🌐 Live Demo:-

🌷 Try MindBalance -
💻 Source Code : https://mental-health-score-1-93t2.onrender.com/

View the GitHub Repository-
🔮 Future Improvements : https://github.com/shuklashreeya/Mental-Health-Score

Some possible improvements for future versions include:

📅 Daily habit tracking
💡 More personalized habit suggestions
🌷 More Cici interactions and expressions
📊 Historical score visualization
🔔 Gentle reminders
🧠 Further model improvements with additional data


⚠️ Disclaimer:-

MindBalance provides a lifestyle-based estimate generated from user-provided inputs.

It is intended for personal awareness and educational purposes and should not be considered a medical diagnosis, clinical assessment, or replacement for professional mental health support.

🌷 Final Note

MindBalance started as a machine learning project and was developed into a complete application by connecting the trained model with a FastAPI backend and an interactive frontend.

The goal was to take a machine learning prediction and turn it into something that feels simple, visual, and approachable for the user.

Built with Python, Machine Learning, FastAPI, JavaScript, and a little Cici magic. 🌷
