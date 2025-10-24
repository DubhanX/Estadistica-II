import React, { useState } from 'react';
import { Calculator, BookOpen, BarChart3, PieChart } from 'lucide-react';

const StatsCalculator = () => {
  const [activeTab, setActiveTab] = useState('discreto');
  
  // Estado para distribución discreta
  const [valores, setValores] = useState('0,1,2,3,4');
  const [frecuencias, setFrecuencias] = useState('3,9,10,6,2');
  const [resultadoDiscreto, setResultadoDiscreto] = useState(null);
  
  // Estado para distribución normal
  const [mediaNormal, setMediaNormal] = useState('100');
  const [desvNormal, setDesvNormal] = useState('15');
  const [valorX, setValorX] = useState('115');
  const [tipoCalculo, setTipoCalculo] = useState('mayor');
  const [valorX2, setValorX2] = useState('85');
  const [resultadoNormal, setResultadoNormal] = useState(null);
  
  // Estado para distribución muestral de la media
  const [mediaPoblacion, setMediaPoblacion] = useState('70');
  const [desvPoblacion, setDesvPoblacion] = useState('12');
  const [tamanioMuestra, setTamanioMuestra] = useState('36');
  const [valorMediaMuestral, setValorMediaMuestral] = useState('73');
  const [resultadoMuestral, setResultadoMuestral] = useState(null);
  
  // Estado para distribución de proporciones
  const [proporcion, setProporcion] = useState('0.40');
  const [tamanioMuestraProp, setTamanioMuestraProp] = useState('100');
  const [proporcionMuestral, setProporcionMuestral] = useState('0.45');
  const [resultadoProporciones, setResultadoProporciones] = useState(null);

  // Función para distribución normal estándar
  const phi = (x) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  };

  const calcularDiscreto = () => {
    const vals = valores.split(',').map(v => parseFloat(v.trim()));
    const freqs = frecuencias.split(',').map(f => parseInt(f.trim()));
    
    if (vals.length !== freqs.length) {
      alert('La cantidad de valores debe coincidir con la cantidad de frecuencias');
      return;
    }
    
    const n = freqs.reduce((a, b) => a + b, 0);
    const probabilidades = freqs.map(f => f / n);
    
    // Valor esperado (media)
    const valorEsperado = vals.reduce((sum, val, i) => sum + val * probabilidades[i], 0);
    
    // Varianza
    const varianza = vals.reduce((sum, val, i) => 
      sum + Math.pow(val - valorEsperado, 2) * probabilidades[i], 0);
    
    // Desviación estándar
    const desviacion = Math.sqrt(varianza);
    
    setResultadoDiscreto({
      valorEsperado,
      varianza,
      desviacion,
      n,
      tabla: vals.map((val, i) => ({
        valor: val,
        frecuencia: freqs[i],
        probabilidad: probabilidades[i]
      }))
    });
  };

  const calcularNormal = () => {
    const mu = parseFloat(mediaNormal);
    const sigma = parseFloat(desvNormal);
    const x = parseFloat(valorX);
    
    const z = (x - mu) / sigma;
    
    let probabilidad;
    let explicacion;
    
    if (tipoCalculo === 'mayor') {
      probabilidad = 1 - phi(z);
      explicacion = `P(X > ${x}) = P(Z > ${z.toFixed(4)})`;
    } else if (tipoCalculo === 'menor') {
      probabilidad = phi(z);
      explicacion = `P(X < ${x}) = P(Z < ${z.toFixed(4)})`;
    } else {
      const x2 = parseFloat(valorX2);
      const z1 = (Math.min(x, x2) - mu) / sigma;
      const z2 = (Math.max(x, x2) - mu) / sigma;
      probabilidad = phi(z2) - phi(z1);
      explicacion = `P(${Math.min(x, x2)} < X < ${Math.max(x, x2)}) = P(${z1.toFixed(4)} < Z < ${z2.toFixed(4)})`;
    }
    
    setResultadoNormal({
      z,
      probabilidad,
      porcentaje: probabilidad * 100,
      explicacion
    });
  };

  const calcularMuestral = () => {
    const mu = parseFloat(mediaPoblacion);
    const sigma = parseFloat(desvPoblacion);
    const n = parseInt(tamanioMuestra);
    const xBarra = parseFloat(valorMediaMuestral);
    
    // Distribución muestral de la media
    const muXBarra = mu;
    const sigmaXBarra = sigma / Math.sqrt(n);
    
    // Calcular probabilidad
    const z = (xBarra - muXBarra) / sigmaXBarra;
    const probabilidad = 1 - phi(z);
    
    setResultadoMuestral({
      muXBarra,
      sigmaXBarra,
      z,
      probabilidad,
      porcentaje: probabilidad * 100
    });
  };

  const calcularProporciones = () => {
    const p = parseFloat(proporcion);
    const n = parseInt(tamanioMuestraProp);
    const pMuestral = parseFloat(proporcionMuestral);
    
    // Distribución muestral de la proporción
    const muP = p;
    const sigmaP = Math.sqrt((p * (1 - p)) / n);
    
    // Calcular probabilidad
    const z = (pMuestral - muP) / sigmaP;
    const probabilidad = 1 - phi(z);
    
    setResultadoProporciones({
      muP,
      sigmaP,
      z,
      probabilidad,
      porcentaje: probabilidad * 100
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <Calculator className="w-10 h-10" />
              <div>
                <h1 className="text-3xl font-bold">Calculadora de Estadística II</h1>
                <p className="text-blue-100 mt-1">Resuelve ejercicios de distribuciones y muestreo</p>
              </div>
            </div>
          </div>

          <div className="flex border-b bg-gray-50">
            <button
              onClick={() => setActiveTab('discreto')}
              className={`flex-1 px-4 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'discreto'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <PieChart className="w-5 h-5" />
              Distribución Discreta
            </button>
            <button
              onClick={() => setActiveTab('normal')}
              className={`flex-1 px-4 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'normal'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Distribución Normal
            </button>
            <button
              onClick={() => setActiveTab('muestral')}
              className={`flex-1 px-4 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'muestral'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Muestral (Media)
            </button>
            <button
              onClick={() => setActiveTab('proporciones')}
              className={`flex-1 px-4 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'proporciones'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calculator className="w-5 h-5" />
              Proporciones
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'discreto' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h3 className="font-bold text-blue-900 mb-2">Ejercicio tipo 1: Distribución de Probabilidad Discreta</h3>
                  <p className="text-blue-800 text-sm">Calcula el valor esperado, varianza y desviación estándar de una variable discreta</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valores de X (separados por comas)
                    </label>
                    <input
                      type="text"
                      value={valores}
                      onChange={(e) => setValores(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0,1,2,3,4"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Frecuencias (f)
                    </label>
                    <input
                      type="text"
                      value={frecuencias}
                      onChange={(e) => setFrecuencias(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3,9,10,6,2"
                    />
                  </div>
                </div>

                <button
                  onClick={calcularDiscreto}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                >
                  Calcular
                </button>

                {resultadoDiscreto && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-bold text-green-900 mb-3">Resultados:</h4>
                      
                      <div className="space-y-2 text-gray-800">
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-semibold">n (Total):</span>
                          <span className="font-mono">{resultadoDiscreto.n}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-semibold">A. Valor Esperado E(X):</span>
                          <span className="font-mono text-lg text-green-700">{resultadoDiscreto.valorEsperado.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-semibold">B. Varianza V(X):</span>
                          <span className="font-mono text-lg text-green-700">{resultadoDiscreto.varianza.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">B. Desviación Estándar σ:</span>
                          <span className="font-mono text-lg text-green-700">{resultadoDiscreto.desviacion.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold mb-2 text-gray-900">Tabla de distribución:</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-200">
                            <tr>
                              <th className="px-4 py-2 text-left">X</th>
                              <th className="px-4 py-2 text-left">f</th>
                              <th className="px-4 py-2 text-left">P(X)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultadoDiscreto.tabla.map((fila, i) => (
                              <tr key={i} className="border-b">
                                <td className="px-4 py-2 font-mono">{fila.valor}</td>
                                <td className="px-4 py-2 font-mono">{fila.frecuencia}</td>
                                <td className="px-4 py-2 font-mono">{fila.probabilidad.toFixed(4)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'normal' && (
              <div className="space-y-6">
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                  <h3 className="font-bold text-purple-900 mb-2">Ejercicio tipo 2: Distribución Normal</h3>
                  <p className="text-purple-800 text-sm">Calcula probabilidades bajo la curva normal</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Media (μ)
                    </label>
                    <input
                      type="number"
                      value={mediaNormal}
                      onChange={(e) => setMediaNormal(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Desviación Estándar (σ)
                    </label>
                    <input
                      type="number"
                      value={desvNormal}
                      onChange={(e) => setDesvNormal(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de cálculo
                  </label>
                  <select
                    value={tipoCalculo}
                    onChange={(e) => setTipoCalculo(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="mayor">P(X &gt; valor)</option>
                    <option value="menor">P(X &lt; valor)</option>
                    <option value="entre">P(valor1 &lt; X &lt; valor2)</option>
                  </select>
                </div>

                {tipoCalculo === 'entre' ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Valor 1
                      </label>
                      <input
                        type="number"
                        value={valorX2}
                        onChange={(e) => setValorX2(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Valor 2
                      </label>
                      <input
                        type="number"
                        value={valorX}
                        onChange={(e) => setValorX(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Valor de X
                    </label>
                    <input
                      type="number"
                      value={valorX}
                      onChange={(e) => setValorX(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                )}

                <button
                  onClick={calcularNormal}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  Calcular
                </button>

                {resultadoNormal && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-bold text-purple-900 mb-3">Resultados:</h4>
                    <div className="space-y-2 text-gray-800">
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">Explicación:</span>
                        <span className="font-mono">{resultadoNormal.explicacion}</span>
                      </div>
                      {tipoCalculo !== 'entre' && (
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-semibold">Valor Z:</span>
                          <span className="font-mono">{resultadoNormal.z.toFixed(4)}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">Probabilidad:</span>
                        <span className="font-mono text-lg text-purple-700">{resultadoNormal.probabilidad.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Porcentaje:</span>
                        <span className="font-mono text-lg text-purple-700">{resultadoNormal.porcentaje.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'muestral' && (
              <div className="space-y-6">
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                  <h3 className="font-bold text-orange-900 mb-2">Ejercicio tipo 3: Distribución Muestral de la Media</h3>
                  <p className="text-orange-800 text-sm">Aplica el Teorema del Límite Central</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Media Poblacional (μ)
                    </label>
                    <input
                      type="number"
                      value={mediaPoblacion}
                      onChange={(e) => setMediaPoblacion(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Desviación Estándar Poblacional (σ)
                    </label>
                    <input
                      type="number"
                      value={desvPoblacion}
                      onChange={(e) => setDesvPoblacion(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tamaño de Muestra (n)
                    </label>
                    <input
                      type="number"
                      value={tamanioMuestra}
                      onChange={(e) => setTamanioMuestra(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Media Muestral (x̄) a evaluar
                    </label>
                    <input
                      type="number"
                      value={valorMediaMuestral}
                      onChange={(e) => setValorMediaMuestral(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={calcularMuestral}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg"
                >
                  Calcular
                </button>

                {resultadoMuestral && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-bold text-orange-900 mb-3">Resultados:</h4>
                    <div className="space-y-2 text-gray-800">
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">A. Media de x̄ (μx̄):</span>
                        <span className="font-mono text-lg text-orange-700">{resultadoMuestral.muXBarra.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">A. Desviación Estándar de x̄ (σx̄):</span>
                        <span className="font-mono text-lg text-orange-700">{resultadoMuestral.sigmaXBarra.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">B. Valor Z:</span>
                        <span className="font-mono">{resultadoMuestral.z.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">B. P(x̄ &gt; {valorMediaMuestral}):</span>
                        <span className="font-mono text-lg text-orange-700">{resultadoMuestral.probabilidad.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">B. Porcentaje:</span>
                        <span className="font-mono text-lg text-orange-700">{resultadoMuestral.porcentaje.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'proporciones' && (
              <div className="space-y-6">
                <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded">
                  <h3 className="font-bold text-teal-900 mb-2">Ejercicio tipo 4: Distribución Muestral de Proporciones</h3>
                  <p className="text-teal-800 text-sm">Calcula probabilidades para proporciones muestrales</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Proporción Poblacional (p)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={proporcion}
                      onChange={(e) => setProporcion(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="0.40"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tamaño de Muestra (n)
                    </label>
                    <input
                      type="number"
                      value={tamanioMuestraProp}
                      onChange={(e) => setTamanioMuestraProp(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Proporción Muestral (p̂) a evaluar
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={proporcionMuestral}
                    onChange={(e) => setProporcionMuestral(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="0.45"
                  />
                </div>

                <button
                  onClick={calcularProporciones}
                  className="w-full bg-gradient-to-r from-teal-600 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-green-700 transition-all shadow-lg"
                >
                  Calcular
                </button>

                {resultadoProporciones && (
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <h4 className="font-bold text-teal-900 mb-3">Resultados:</h4>
                    <div className="space-y-2 text-gray-800">
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">A. Media de p̂ (μp̂):</span>
                        <span className="font-mono text-lg text-teal-700">{resultadoProporciones.muP.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">A. Desviación Estándar de p̂ (σp̂):</span>
                        <span className="font-mono text-lg text-teal-700">{resultadoProporciones.sigmaP.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">B. Valor Z:</span>
                        <span className="font-mono">{resultadoProporciones.z.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="font-semibold">B. P(p̂ &gt; {proporcionMuestral}):</span>
                        <span className="font-mono text-lg text-teal-700">{resultadoProporciones.probabilidad.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">B. Porcentaje:</span>
                        <span className="font-mono text-lg text-teal-700">{resultadoProporciones.porcentaje.toFixed(2)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4"> Guía de Uso Basica </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">Distribución Discreta:</h4>
              <p>Ingresa los valores de X y sus frecuencias separadas por comas, Ejemplo: valores "0,1,2,3,4" y frecuencias "3,9,10,6,2"</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-600">Distribución Normal:</h4>
              <p>Ingresa la media (μ), desviación estándar (σ) y el valor de X, Selecciona el tipo de probabilidad que deseas calcular.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-600">Distribución Muestral (Media):</h4>
              <p>Usa el Teorema del Límite Central. Ingresa μ, σ poblacionales, el tamaño de muestra n y la media muestral x̄ a evaluar.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-teal-600">Distribución de Proporciones:</h4>
              <p>Ingresa la proporción poblacional p (ejemplo: 0.40 para 40%), el tamaño de muestra n y la proporción muestral p̂ a evaluar.</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center pb-4">
          <p className="text-gray-600 text-sm">
            Creado por <span className="font-semibold text-blue-600">Dubhan Piñeres Navarro</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsCalculator;