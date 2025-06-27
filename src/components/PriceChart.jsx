import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const PriceChart = ({ data }) => {
  if (!data || data.length === 0) return null

  const chartData = data.map((item, index) => ({
    name: item.site,
    price: parseFloat(item.price.replace(/[^0-9]/g, '')),
    fullName: item.title.substring(0, 30) + '...'
  }))

  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4']

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Comparison Chart</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `৳${(value / 100000).toFixed(0)}L`}
            />
            <Tooltip 
              formatter={(value) => [`৳${value.toLocaleString()}`, 'Price']}
              labelFormatter={(label) => `Site: ${label}`}
            />
            <Bar dataKey="price" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default PriceChart