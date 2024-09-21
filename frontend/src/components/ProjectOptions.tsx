import React, { useState } from 'react';
import './style.css';

interface ProjectOptions {
  typescript: boolean;
  jwt: boolean;
  crud: boolean;
}

const ProjectOptions: React.FC = () => {
  const [useTypescript, setUseTypescript] = useState<boolean>(true);
  const [enableJWT, setEnableJWT] = useState<boolean>(false);
  const [enableCRUD, setEnableCRUD] = useState<boolean>(false);

  const handleSubmit = async () => {
    const options: ProjectOptions = {
      typescript: useTypescript,
      jwt: enableJWT,
      crud: enableCRUD,
    };

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    const data = await response.json();
    alert(data.message);
  };

  return (
    <div className="generator-container">
      <h1>Choisissez les options de votre projet</h1>
      <div>
        <label>
          <input
            type="radio"
            checked={useTypescript}
            onChange={() => setUseTypescript(true)}
          />
          TypeScript
        </label>
        <label>
          <input
            type="radio"
            checked={!useTypescript}
            onChange={() => setUseTypescript(false)}
          />
          JavaScript
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={enableJWT}
            onChange={() => setEnableJWT(!enableJWT)}
          />
          Authentification JWT
        </label>
        <label>
          <input
            type="checkbox"
            checked={enableCRUD}
            onChange={() => setEnableCRUD(!enableCRUD)}
          />
          CRUD sur les utilisateurs
        </label>
      </div>
      <button onClick={handleSubmit}>Générer le projet</button>
    </div>
  );
};

export default ProjectOptions;
