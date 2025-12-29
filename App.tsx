import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  AlertCircle,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';

// --- Components ---

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  step?: number;
  prefix?: string;
  suffix?: string;
  helperText?: string;
}

const InputField: React.FC<InputFieldProps> = ({ 
  label, 
  value, 
  onChange, 
  step = 0.1, 
  prefix, 
  suffix,
  helperText 
}) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <div className="relative rounded-md shadow-sm">
      {prefix && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-slate-500 sm:text-sm">{prefix}</span>
        </div>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
        className={`block w-full rounded-md border-slate-300 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white border px-3 ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`}
      />
      {suffix && (
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <span className="text-slate-500 sm:text-sm">{suffix}</span>
        </div>
      )}
    </div>
    {helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
  </div>
);

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}

const SliderField: React.FC<SliderFieldProps> = ({ label, value, onChange, min, max, step, suffix }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <span className="text-sm font-bold text-indigo-600">{value}{suffix}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
    />
  </div>
);

// --- Main App ---

export default function App() {
  // State variables derived from the user's text
  const [currentPrice, setCurrentPrice] = useState<number>(48.9);
  const [successPrice, setSuccessPrice] = useState<number>(73.4);
  const [preNewsPrice, setPreNewsPrice] = useState<number>(47.0);
  const [failureMultiplier, setFailureMultiplier] = useState<number>(0.9); // 0.9 represents 90%
  const [probabilitySuccess, setProbabilitySuccess] = useState<number>(0.5); // 0.5 represents 50%

  // Calculations
  const failurePrice = useMemo(() => preNewsPrice * failureMultiplier, [preNewsPrice, failureMultiplier]);
  
  // Profit/Loss raw
  const profitIfSuccess = useMemo(() => successPrice - currentPrice, [successPrice, currentPrice]);
  const lossIfFailure = useMemo(() => failurePrice - currentPrice, [failurePrice, currentPrice]);

  // Weighted Expectation
  const weightedProfit = useMemo(() => profitIfSuccess * probabilitySuccess, [profitIfSuccess, probabilitySuccess]);
  const weightedLoss = useMemo(() => lossIfFailure * (1 - probabilitySuccess), [lossIfFailure, probabilitySuccess]);
  
  const expectedValue = useMemo(() => weightedProfit + weightedLoss, [weightedProfit, weightedLoss]);
  const roi = useMemo(() => (expectedValue / currentPrice) * 100, [expectedValue, currentPrice]);

  // Chart Data
  const chartData = [
    {
      name: 'Kịch bản',
      Success: parseFloat(weightedProfit.toFixed(2)),
      Failure: parseFloat(weightedLoss.toFixed(2)),
      Net: parseFloat(expectedValue.toFixed(2)),
    }
  ];

  const formatNumber = (num: number) => num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  const formatPercent = (num: number) => `${(num * 100).toFixed(0)}%`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 flex items-center space-x-3">
          <div className="p-3 bg-indigo-600 rounded-lg shadow-lg">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Công cụ tính toán Deal M&A</h1>
            <p className="text-slate-500 text-sm">Mô hình định giá theo xác suất (Expected Value)</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-slate-800">
                <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
                Biến số thị trường
              </h2>
              
              <InputField 
                label="Giá thị trường hiện tại" 
                value={currentPrice} 
                onChange={setCurrentPrice} 
                prefix="$"
              />
              
              <div className="my-6 border-t border-slate-100"></div>
              
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Kịch bản Thành công (Deal Done)</h3>
              <InputField 
                label="Giá mục tiêu khi deal thành công" 
                value={successPrice} 
                onChange={setSuccessPrice} 
                prefix="$"
              />
               <SliderField 
                label="Xác suất thành công"
                value={probabilitySuccess}
                min={0}
                max={1}
                step={0.05}
                onChange={setProbabilitySuccess}
                suffix={` (${(probabilitySuccess * 100).toFixed(0)}%)`}
              />

              <div className="my-6 border-t border-slate-100"></div>

              <h3 className="text-sm font-semibold text-slate-900 mb-3">Kịch bản Thất bại (Deal Fail)</h3>
              <InputField 
                label="Giá nền trước khi có tin đồn" 
                value={preNewsPrice} 
                onChange={setPreNewsPrice} 
                prefix="$"
              />
              <InputField 
                label="Hệ số điều chỉnh giảm (Multiplier)" 
                value={failureMultiplier} 
                onChange={setFailureMultiplier} 
                step={0.05}
                helperText={`Giá giảm về: ${formatNumber(preNewsPrice)} * ${failureMultiplier} = ${formatNumber(failurePrice)}`}
              />
              <div className="text-xs text-slate-500 mt-2 flex justify-between">
                <span>Xác suất thất bại:</span>
                <span className="font-medium">{(100 - probabilitySuccess * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Right Column: Results & Visualization */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Dynamic Text Section (The User's Request) */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold mb-4 text-slate-800 border-b border-slate-100 pb-2">
                Diễn giải tính toán
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-sm leading-relaxed">
                <p className="mb-2">
                  Giá TLG hiện tại là: <span className="font-bold text-indigo-700">{currentPrice}</span>
                </p>
                <p className="mb-2">
                  Giá khi deal của Kokuyo thành công: <span className="font-bold text-green-600">{successPrice}</span>
                </p>
                <p className="mb-4">
                  Giá trước khi có tin M&A là khoảng: <span className="font-bold text-slate-800">{preNewsPrice}</span>
                  <br/>
                  Giả định giá sau khi deal bất thành: {preNewsPrice} * {failureMultiplier} = <span className="font-bold text-red-600">{formatNumber(failurePrice)}</span>
                </p>

                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li>
                    Lợi nhuận điều chỉnh khi deal thành công: 
                    ({successPrice} - {currentPrice}) * {formatPercent(probabilitySuccess)} = <span className="font-bold text-green-600">+{formatNumber(weightedProfit)}</span>
                  </li>
                  <li>
                    Lỗ điều chỉnh khi deal thất bại: 
                    ({formatNumber(failurePrice)} - {currentPrice}) * {formatPercent(1 - probabilitySuccess)} = <span className="font-bold text-red-600">{formatNumber(weightedLoss)}</span>
                  </li>
                </ul>

                <p className="border-t border-slate-300 pt-3">
                  <ArrowRight className="inline w-4 h-4 mr-1"/> 
                  Giá trị lãi ước tính của deal này: {formatNumber(weightedProfit)} {weightedLoss >= 0 ? '+' : '-'} {Math.abs(weightedLoss).toFixed(2)} = <span className={`font-bold text-lg ${expectedValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatNumber(expectedValue)}</span>
                </p>
                <p>
                  <ArrowRight className="inline w-4 h-4 mr-1"/> 
                  Tỷ suất sinh lời (ROI): {formatNumber(expectedValue)} / {currentPrice} = <span className={`font-bold text-lg ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatNumber(roi)}%</span>
                </p>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl border ${roi >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Lợi nhuận kỳ vọng</span>
                  <DollarSign className={`w-4 h-4 ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div className={`text-2xl font-bold ${roi >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatNumber(expectedValue)}
                </div>
                <div className="text-xs text-slate-500 mt-1">Weighted Average Value</div>
              </div>

              <div className={`p-4 rounded-xl border ${roi >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">ROI Ước tính</span>
                  <Percent className={`w-4 h-4 ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div className={`text-2xl font-bold ${roi >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {formatNumber(roi)}%
                </div>
                <div className="text-xs text-slate-500 mt-1">Return on Investment</div>
              </div>

              <div className="p-4 rounded-xl border bg-white border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Tỷ lệ Lợi nhuận/Rủi ro</span>
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {Math.abs(lossIfFailure) > 0 ? (profitIfSuccess / Math.abs(lossIfFailure)).toFixed(2) : "∞"}x
                </div>
                <div className="text-xs text-slate-500 mt-1">Reward : Risk Ratio</div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-80">
               <h2 className="text-sm font-semibold mb-4 text-slate-500 uppercase tracking-wide">Phân bổ lãi/lỗ kỳ vọng</h2>
               <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#e2e8f0" />
                  <XAxis type="number" domain={['auto', 'auto']} hide />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <ReferenceLine x={0} stroke="#94a3b8" />
                  <Legend />
                  <Bar dataKey="Success" name="Lợi nhuận (Thành công)" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={40} />
                  <Bar dataKey="Failure" name="Lỗ (Thất bại)" fill="#ef4444" radius={[4, 0, 0, 4]} barSize={40} />
                  <Bar dataKey="Net" name="Tổng lợi nhuận kỳ vọng" fill="#6366f1" radius={[4, 4, 4, 4]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}