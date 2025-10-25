import React, { useState } from 'react';
import { Calculator, BookOpen, BarChart3, PieChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const StatsCalculator = () => {
  const [activeTab, setActiveTab] = useState('discreto');
  
  const [valores, setValores] = useState('0,1,2,3,4');
  const [frecuencias, setFrecuencias] = useState('3,9,10,6,2');
  const [resultadoDiscreto, setResultadoDiscreto] = useState(null);
  
  const [mediaNormal, setMediaNormal] = useState('100');
  const [desvNormal, setDesvNormal] = useState('15');
  const [valorX, setValorX] = useState('115');
  const [tipoCalculo, setTipoCalculo] = useState('mayor');
  const [valorX2, setValorX2] = useState('85');
  const [resultadoNormal, setResultadoNormal] = useState(null);
  
  const [mediaPoblacion, setMediaPoblacion] = useState('70');
  const [desvPoblacion, setDesvPoblacion] = useState('12');
  const [tamanioMuestra, setTamanioMuestra] = useState('36');
  const [valorMediaMuestral, setValorMediaMuestral] = useState('73');
  const [tipoEntradaMedia, setTipoEntradaMedia] = useState('directa');
  const [tipoCalculoMedia, setTipoCalculoMedia] = useState('mayor');
  const [valorMediaMuestral2, setValorMediaMuestral2] = useState('67');
  const [datosMuestra, setDatosMuestra] = useState('');
  const [resultadoMuestral, setResultadoMuestral] = useState(null);
  
  const [proporcion, setProporcion] = useState('0.40');
  const [tamanioMuestraProp, setTamanioMuestraProp] = useState('100');
  const [proporcionMuestral, setProporcionMuestral] = useState('0.45');
  const [resultadoProporciones, setResultadoProporciones] = useState(null);

  const phi = (x) => {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return x > 0 ? 1 - p : p;
  };

  const normalPDF = (x, mu = 0, sigma = 1) => {
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
  };

  const generarDatosNormal = (mu, sigma, valorRef, tipo, valor2 = null) => {
    const puntos = [];
    const rangoInicio = mu - 4 * sigma;
    const rangoFin = mu + 4 * sigma;
    const paso = (rangoFin - rangoInicio) / 200;
    
    for (let x = rangoInicio; x <= rangoFin; x += paso) {
      const y = normalPDF(x, mu, sigma);
      let enArea = false;
      
      if (tipo === 'mayor') {
        enArea = x >= valorRef;
      } else if (tipo === 'menor') {
        enArea = x <= valorRef;
      } else if (tipo === 'entre' && valor2 !== null) {
        enArea = x >= Math.min(valorRef, valor2) && x <= Math.max(valorRef, valor2);
      }
      
      puntos.push({
        x: parseFloat(x.toFixed(2)),
        y: parseFloat(y.toFixed(6)),
        yArea: enArea ? parseFloat(y.toFixed(6)) : 0
      });
    }
    
    return puntos;
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
    
    const valorEsperado = vals.reduce((sum, val, i) => sum + val * probabilidades[i], 0);
    const varianza = vals.reduce((sum, val, i) => sum + Math.pow(val - valorEsperado, 2) * probabilidades[i], 0);
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
    let datosGrafica;
    
    if (tipoCalculo === 'mayor') {
      probabilidad = 1 - phi(z);
      explicacion = `P(X > ${x}) = P(Z > ${z.toFixed(4)})`;
      datosGrafica = generarDatosNormal(mu, sigma, x, 'mayor');
    } else if (tipoCalculo === 'menor') {
      probabilidad = phi(z);
      explicacion = `P(X < ${x}) = P(Z < ${z.toFixed(4)})`;
      datosGrafica = generarDatosNormal(mu, sigma, x, 'menor');
    } else {
      const x2 = parseFloat(valorX2);
      const z1 = (Math.min(x, x2) - mu) / sigma;
      const z2 = (Math.max(x, x2) - mu) / sigma;
      probabilidad = phi(z2) - phi(z1);
      explicacion = `P(${Math.min(x, x2)} < X < ${Math.max(x, x2)}) = P(${z1.toFixed(4)} < Z < ${z2.toFixed(4)})`;
      datosGrafica = generarDatosNormal(mu, sigma, x, 'entre', x2);
    }
    
    setResultadoNormal({
      z,
      probabilidad,
      porcentaje: probabilidad * 100,
      explicacion,
      datosGrafica
    });
  };

  const calcularMuestral = () => {
    const mu = parseFloat(mediaPoblacion);
    const sigma = parseFloat(desvPoblacion);
    let n;
    let xBarra;
    let mediaMuestralCalculada = null;
    
    if (tipoEntradaMedia === 'datos') {
      const datos = datosMuestra.split(',').map(d => parseFloat(d.trim())).filter(d => !isNaN(d));
      if (datos.length === 0) {
        alert('Ingresa datos válidos separados por comas');
        return;
      }
      n = datos.length;
      xBarra = datos.reduce((sum, val) => sum + val, 0) / n;
      mediaMuestralCalculada = xBarra;
    } else {
      n = parseInt(tamanioMuestra);
      xBarra = parseFloat(valorMediaMuestral);
    }
    
    const muXBarra = mu;
    const sigmaXBarra = sigma / Math.sqrt(n);
    
    const z = (xBarra - muXBarra) / sigmaXBarra;
    
    let probabilidad;
    let explicacion;
    let datosGrafica;
    
    if (tipoCalculoMedia === 'mayor') {
      probabilidad = 1 - phi(z);
      explicacion = `P(x̄ > ${xBarra.toFixed(2)})`;
      datosGrafica = generarDatosNormal(muXBarra, sigmaXBarra, xBarra, 'mayor');
    } else if (tipoCalculoMedia === 'menor') {
      probabilidad = phi(z);
      explicacion = `P(x̄ < ${xBarra.toFixed(2)})`;
      datosGrafica = generarDatosNormal(muXBarra, sigmaXBarra, xBarra, 'menor');
    } else {
      const xBarra2 = parseFloat(valorMediaMuestral2);
      const z1 = (Math.min(xBarra, xBarra2) - muXBarra) / sigmaXBarra;
      const z2 = (Math.max(xBarra, xBarra2) - muXBarra) / sigmaXBarra;
      probabilidad = phi(z2) - phi(z1);
      explicacion = `P(${Math.min(xBarra, xBarra2).toFixed(2)} < x̄ < ${Math.max(xBarra, xBarra2).toFixed(2)})`;
      datosGrafica = generarDatosNormal(muXBarra, sigmaXBarra, xBarra, 'entre', xBarra2);
    }
    
    setResultadoMuestral({
      muXBarra,
      sigmaXBarra,
      z,
      probabilidad,
      porcentaje: probabilidad * 100,
      datosGrafica,
      n,
      xBarra,
      mediaMuestralCalculada,
      explicacion
    });
  };

  const calcularProporciones = () => {
    const p = parseFloat(proporcion);
    const n = parseInt(tamanioMuestraProp);
    const pMuestral = parseFloat(proporcionMuestral);
    
    const muP = p;
    const sigmaP = Math.sqrt((p * (1 - p)) / n);
    
    const z = (pMuestral - muP) / sigmaP;
    const probabilidad = 1 - phi(z);
    
    const datosGrafica = generarDatosNormal(muP, sigmaP, pMuestral, 'mayor');
    
    setResultadoProporciones({
      muP,
      sigmaP,
      z,
      probabilidad,
      porcentaje: probabilidad * 100,
      datosGrafica
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

          <div className="flex flex-wrap border-b bg-gray-50 overflow-x-auto">
            <button
              onClick={() => setActiveTab('discreto')}
              className={`flex-1 min-w-[120px] px-3 py-3 sm:px-4 sm:py-4 font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                activeTab === 'discreto' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <PieChart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Distribución Discreta</span>
              <span className="sm:hidden">Discreta</span>
            </button>
            <button
              onClick={() => setActiveTab('normal')}
              className={`flex-1 min-w-[120px] px-3 py-3 sm:px-4 sm:py-4 font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                activeTab === 'normal' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Distribución Normal</span>
              <span className="sm:hidden">Normal</span>
            </button>
            <button
              onClick={() => setActiveTab('muestral')}
              className={`flex-1 min-w-[120px] px-3 py-3 sm:px-4 sm:py-4 font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                activeTab === 'muestral' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Muestral (Media)</span>
              <span className="sm:hidden">Muestral</span>
            </button>
            <button
              onClick={() => setActiveTab('proporciones')}
              className={`flex-1 min-w-[120px] px-3 py-3 sm:px-4 sm:py-4 font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                activeTab === 'proporciones' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Proporciones</span>
              <span className="sm:hidden">Proporción</span>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valores de X (separados por comas)</label>
                    <input type="text" value={valores} onChange={(e) => setValores(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="0,1,2,3,4" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Frecuencias (f)</label>
                    <input type="text" value={frecuencias} onChange={(e) => setFrecuencias(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="3,9,10,6,2" />
                  </div>
                </div>

                <button onClick={calcularDiscreto} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">Calcular</button>

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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Media (μ)</label>
                    <input type="number" value={mediaNormal} onChange={(e) => setMediaNormal(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Desviación Estándar (σ)</label>
                    <input type="number" value={desvNormal} onChange={(e) => setDesvNormal(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de cálculo</label>
                  <select value={tipoCalculo} onChange={(e) => setTipoCalculo(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option value="mayor">P(X &gt; valor)</option>
                    <option value="menor">P(X &lt; valor)</option>
                    <option value="entre">P(valor1 &lt; X &lt; valor2)</option>
                  </select>
                </div>

                {tipoCalculo === 'entre' ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Valor 1</label>
                      <input type="number" value={valorX2} onChange={(e) => setValorX2(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Valor 2</label>
                      <input type="number" value={valorX} onChange={(e) => setValorX(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Valor de X</label>
                    <input type="number" value={valorX} onChange={(e) => setValorX(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
                  </div>
                )}

                <button onClick={calcularNormal} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg">Calcular</button>

                {resultadoNormal && (
                  <div className="space-y-4">
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

                    <div className="bg-white border border-purple-200 rounded-lg p-4">
                      <h5 className="font-semibold mb-3 text-gray-900">Gráfica de la Distribución Normal:</h5>
                      
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Escala Original (X):</p>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={resultadoNormal.datosGrafica}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="x" label={{ value: 'Valores de X', position: 'insideBottom', offset: -5 }} />
                            <YAxis label={{ value: 'Densidad', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="y" stroke="#8b5cf6" fill="#e9d5ff" fillOpacity={0.3} />
                            <Area type="monotone" dataKey="yArea" stroke="#8b5cf6" fill="#a855f7" fillOpacity={0.6} />
                            <ReferenceLine x={parseFloat(valorX)} stroke="#7c3aed" strokeWidth={2} strokeDasharray="3 3" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Escala Estandarizada (Z):</p>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={resultadoNormal.datosGrafica}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="z" label={{ value: 'Valores de Z', position: 'insideBottom', offset: -5 }} />
                            <YAxis label={{ value: 'Densidad', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="y" stroke="#8b5cf6" fill="#e9d5ff" fillOpacity={0.3} />
                            <Area type="monotone" dataKey="yArea" stroke="#8b5cf6" fill="#a855f7" fillOpacity={0.6} />
                            <ReferenceLine x={parseFloat(resultadoNormal.z.toFixed(2))} stroke="#7c3aed" strokeWidth={2} strokeDasharray="3 3" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <p className="text-sm text-center text-gray-600 mt-2">El área sombreada representa la probabilidad calculada en ambas escalas</p>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Media Poblacional (μ)</label>
                    <input type="number" value={mediaPoblacion} onChange={(e) => setMediaPoblacion(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Desviación Estándar Poblacional (σ)</label>
                    <input type="number" value={desvPoblacion} onChange={(e) => setDesvPoblacion(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">¿Cómo ingresar la media muestral?</label>
                  <select value={tipoEntradaMedia} onChange={(e) => setTipoEntradaMedia(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="directa">Tengo la media muestral (x̄) directamente</option>
                    <option value="datos">Calcular x̄ desde los datos de la muestra</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de cálculo</label>
                  <select value={tipoCalculoMedia} onChange={(e) => setTipoCalculoMedia(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="mayor">P(x̄ &gt; valor)</option>
                    <option value="menor">P(x̄ &lt; valor)</option>
                    <option value="entre">P(valor1 &lt; x̄ &lt; valor2)</option>
                  </select>
                </div>

                {tipoEntradaMedia === 'directa' ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tamaño de Muestra (n)</label>
                        <input type="number" value={tamanioMuestra} onChange={(e) => setTamanioMuestra(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {tipoCalculoMedia === 'entre' ? 'Media Muestral 1 (x̄₁)' : 'Media Muestral (x̄)'}
                        </label>
                        <input type="number" value={valorMediaMuestral} onChange={(e) => setValorMediaMuestral(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                      </div>
                    </div>
                    {tipoCalculoMedia === 'entre' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Media Muestral 2 (x̄₂)</label>
                        <input type="number" value={valorMediaMuestral2} onChange={(e) => setValorMediaMuestral2(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Datos de la muestra (separados por comas)</label>
                    <textarea
                      value={datosMuestra}
                      onChange={(e) => setDatosMuestra(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows="3"
                      placeholder="Ejemplo: 72, 68, 75, 73, 71, 69, 74, 70, 76, 72"
                    />
                    <p className="text-sm text-gray-600 mt-1">La app calculará automáticamente n y x̄</p>
                  </div>
                )}

                <button onClick={calcularMuestral} className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg">Calcular</button>

                {resultadoMuestral && (
                  <div className="space-y-4">
                    {resultadoMuestral.mediaMuestralCalculada !== null && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-bold text-blue-900 mb-2">Media muestral calculada:</h4>
                        <div className="space-y-1 text-gray-800">
                          <div className="flex justify-between">
                            <span className="font-semibold">Tamaño de muestra (n):</span>
                            <span className="font-mono text-lg text-blue-700">{resultadoMuestral.n}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold">Media muestral (x̄):</span>
                            <span className="font-mono text-lg text-blue-700">{resultadoMuestral.xBarra.toFixed(4)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-bold text-orange-900 mb-3">Resultados:</h4>
                      <div className="space-y-2 text-gray-800">
                        <div className="flex justify-between border-b pb-2">
                          <span className="font-semibold">Explicación:</span>
                          <span className="font-mono text-sm sm:text-base">{resultadoMuestral.explicacion}</span>
                        </div>
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
                          <span className="font-semibold">B. Probabilidad:</span>
                          <span className="font-mono text-lg text-orange-700">{resultadoMuestral.probabilidad.toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold">B. Porcentaje:</span>
                          <span className="font-mono text-lg text-orange-700">{resultadoMuestral.porcentaje.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-orange-200 rounded-lg p-4">
                      <h5 className="font-semibold mb-3 text-gray-900">Gráfica de la Distribución Muestral:</h5>
                      
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Escala Original (x̄):</p>
                        <ResponsiveContainer width="100%" height={250}>
                          <AreaChart data={resultadoMuestral.datosGrafica}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="x" label={{ value: 'Media Muestral (x̄)', position: 'insideBottom', offset: -5 }} tick={{ fontSize: 12 }} />
                            <YAxis label={{ value: 'Densidad', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="y" stroke="#f97316" fill="#fed7aa" fillOpacity={0.3} />
                            <Area type="monotone" dataKey="yArea" stroke="#f97316" fill="#fb923c" fillOpacity={0.6} />
                            <ReferenceLine x={resultadoMuestral.xBarra} stroke="#ea580c" strokeWidth={2} strokeDasharray="3 3" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Escala Estandarizada (Z):</p>
                        <ResponsiveContainer width="100%" height={250}>
                          <AreaChart data={resultadoMuestral.datosGrafica}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="z" label={{ value: 'Valores de Z', position: 'insideBottom', offset: -5 }} tick={{ fontSize: 12 }} />
                            <YAxis label={{ value: 'Densidad', angle: -90, position: 'insideLeft' }} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="y" stroke="#f97316" fill="#fed7aa" fillOpacity={0.3} />
                            <Area type="monotone" dataKey="yArea" stroke="#f97316" fill="#fb923c" fillOpacity={0.6} />
                            <ReferenceLine x={parseFloat(resultadoMuestral.z.toFixed(2))} stroke="#ea580c" strokeWidth={2} strokeDasharray="3 3" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <p className="text-sm text-center text-gray-600 mt-2">El área sombreada representa la probabilidad calculada en ambas escalas</p>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Proporción Poblacional (p)</label>
                    <input type="number" step="0.01" value={proporcion} onChange={(e) => setProporcion(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder="0.40" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tamaño de Muestra (n)</label>
                    <input type="number" value={tamanioMuestraProp} onChange={(e) => setTamanioMuestraProp(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Proporción Muestral (p̂) a evaluar</label>
                  <input type="number" step="0.01" value={proporcionMuestral} onChange={(e) => setProporcionMuestral(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent" placeholder="0.45" />
                </div>

                <button onClick={calcularProporciones} className="w-full bg-gradient-to-r from-teal-600 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-green-700 transition-all shadow-lg">Calcular</button>

                {resultadoProporciones && (
                  <div className="space-y-4">
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

                    <div className="bg-white border border-teal-200 rounded-lg p-4">
                      <h5 className="font-semibold mb-3 text-gray-900">Gráfica de la Distribución de Proporciones:</h5>
                      
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Escala Original (p̂):</p>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={resultadoProporciones.datosGrafica}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="x" label={{ value: 'Proporción Muestral (p̂)', position: 'insideBottom', offset: -5 }} />
                            <YAxis label={{ value: 'Densidad', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="y" stroke="#14b8a6" fill="#99f6e4" fillOpacity={0.3} />
                            <Area type="monotone" dataKey="yArea" stroke="#14b8a6" fill="#2dd4bf" fillOpacity={0.6} />
                            <ReferenceLine x={parseFloat(proporcionMuestral)} stroke="#0d9488" strokeWidth={2} strokeDasharray="3 3" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Escala Estandarizada (Z):</p>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={resultadoProporciones.datosGrafica}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="z" label={{ value: 'Valores de Z', position: 'insideBottom', offset: -5 }} />
                            <YAxis label={{ value: 'Densidad', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="y" stroke="#14b8a6" fill="#99f6e4" fillOpacity={0.3} />
                            <Area type="monotone" dataKey="yArea" stroke="#14b8a6" fill="#2dd4bf" fillOpacity={0.6} />
                            <ReferenceLine x={parseFloat(resultadoProporciones.z.toFixed(2))} stroke="#0d9488" strokeWidth={2} strokeDasharray="3 3" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <p className="text-sm text-center text-gray-600 mt-2">El área sombreada representa la probabilidad calculada en ambas escalas</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Guía de Uso</h3>
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
              <p>Usa el Teorema del Límite Central, Ingresa μ, σ poblacionales, el tamaño de muestra n y la media muestral x̄ a evaluar.</p>
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