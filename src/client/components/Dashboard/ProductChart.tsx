import React from 'react';

interface ProductCategoryData {
  name: string;
  revenue: number;
  margin: number;
  share: number;
}

interface ProductChartProps {
  data: ProductCategoryData[];
}

export const ProductChart: React.FC<ProductChartProps> = ({ data }) => {
  const getMarginColor = (margin: number) => {
    if (margin >= 40) return 'text-green-400';
    if (margin >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
        <span>📦</span>
        <span>产品分类</span>
      </h3>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-white/70 text-left py-2 text-sm">品类</th>
              <th className="text-white/70 text-right py-2 text-sm">营收</th>
              <th className="text-white/70 text-right py-2 text-sm">占比</th>
              <th className="text-white/70 text-right py-2 text-sm">毛利率</th>
            </tr>
          </thead>
          <tbody>
            {data.map((product, index) => (
              <tr key={index} className="border-b border-white/10">
                <td className="py-3 text-white">{product.name}</td>
                <td className="py-3 text-right text-white/90">
                  ¥{(product.revenue / 10000).toFixed(0)}万
                </td>
                <td className="py-3 text-right text-white/90">
                  {product.share.toFixed(1)}%
                </td>
                <td className={`py-3 text-right font-medium ${getMarginColor(product.margin)}`}>
                  {product.margin.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 总计 */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex justify-between text-white/70 text-sm">
          <span>总营收</span>
          <span className="text-white font-medium">
            ¥{(data.reduce((sum, p) => sum + p.revenue, 0) / 10000).toFixed(0)}万
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductChart;
