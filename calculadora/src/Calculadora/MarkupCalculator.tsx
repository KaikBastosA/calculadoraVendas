import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

interface VariableCost {
  id: number;
  name: string;
  value: number;
}

interface Results {
  totalVariablePercent: string;
  markup: string;
  sellingPrice: string;
}

const MarkupCalculator: React.FC = () => {
  const [fixedCost, setFixedCost] = useState<number>(50);
  const [variableCosts, setVariableCosts] = useState<VariableCost[]>([
    { id: 1, name: 'ICMS', value: 17 },
    { id: 2, name: 'PIS', value: 0.65 },
    { id: 3, name: 'COFINS', value: 3 },
    { id: 4, name: 'Comissão', value: 2 },
    { id: 5, name: 'Marketing', value: 3 },
    { id: 6, name: 'Desp. Financeiras', value: 2.38 },
    { id: 7, name: 'Lucro', value: 20 },
  ]);

  const [results, setResults] = useState<Results | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddCost = () => {
    const newId = variableCosts.length > 0 ? Math.max(...variableCosts.map(c => c.id)) + 1 : 1;
    setVariableCosts([...variableCosts, { id: newId, name: '', value: 0 }]);
  };

  const handleRemoveCost = (id: number) => {
    setVariableCosts(variableCosts.filter(cost => cost.id !== id));
  };

  const handleCostChange = (id: number, field: keyof VariableCost, value: string | number) => {
    const updatedCosts = variableCosts.map(cost => {
      if (cost.id === id) {
        return { ...cost, [field]: field === 'value' ? Number(value) : value };
      }
      return cost;
    });
    setVariableCosts(updatedCosts);
  };

  const calculateMarkup = () => {
    const totalVariablePercent = variableCosts.reduce((sum, cost) => sum + (cost.value || 0), 0);

    if (totalVariablePercent >= 100) {
      setError("A soma dos custos variáveis não pode ser igual ou superior a 100%.");
      setResults(null);
      return;
    }

    const variableCostsDecimal = totalVariablePercent / 100;
    const markup = 1 - variableCostsDecimal;
    const sellingPrice = (fixedCost || 0) / markup;

    setResults({
      totalVariablePercent: totalVariablePercent.toFixed(2),
      markup: markup.toFixed(4),
      sellingPrice: sellingPrice.toFixed(2),
    });
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 4000); // O popup desaparecerá após 4 segundos

      return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado
    }
  }, [error]);

  return (
    <>
      <div className={styles.calculatorContainer}>
        <h1>Calculadora de Preço de Venda</h1>

        <div className={styles.inputGroup}>
          <label htmlFor="fixedCost">Custo do Produto (R$)</label>
          <input
            type="number"
            id="fixedCost"
            value={fixedCost}
            onChange={(e) => setFixedCost(Number(e.target.value))}
            placeholder="Ex: 50.00"
          />
        </div>

        <div className={styles.variableCostsContainer}>
          <h2>Custos Variáveis e Lucro (%)</h2>
          {variableCosts.map(cost => (
            <div key={cost.id} className={styles.variableCostItem}>
              <input
                type="text"
                value={cost.name}
                onChange={(e) => handleCostChange(cost.id, 'name', e.target.value)}
                placeholder="Nome do Custo"
              />
              <input
                type="number"
                value={cost.value}
                onChange={(e) => handleCostChange(cost.id, 'value', e.target.value)}
                placeholder="%"
              />
              <button className={styles.removeBtn} onClick={() => handleRemoveCost(cost.id)}>
                Remover
              </button>
            </div>
          ))}
        </div>

        <div className={styles.actionsContainer}>
          <button className={styles.addBtn} onClick={handleAddCost}>
            Adicionar Custo
          </button>
          <button className={styles.calculateBtn} onClick={calculateMarkup}>
            Calcular Preço de Venda
          </button>
        </div>

        {results && (
          <div className={styles.resultsContainer}>
            <h2>Resultados</h2>
            <div className={styles.resultItem}>
              <p>
                Soma dos Custos Variáveis:{' '}
                <span>{results.totalVariablePercent}%</span>
              </p>
            </div>
            <div className={styles.resultItem}>
              <p>
                Markup Divisor: <span>{results.markup}</span>
              </p>
            </div>
            <div className={styles.resultItem}>
              <p>
                Preço de Venda Sugerido:{' '}
                <span>R$ {results.sellingPrice}</span>
              </p>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className={styles.errorPopup}>
          <p>{error}</p>
        </div>
      )}
    </>
  );
};

export default MarkupCalculator;