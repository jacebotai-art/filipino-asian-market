export function PaymentIcons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-4">
      {/* Cash App / Generic */}
      <div className="w-12 h-8 bg-green-500 rounded flex items-center justify-center">
        <span className="text-white font-bold text-lg">$</span>
      </div>
      
      {/* Apple Pay */}
      <div className="w-12 h-8 bg-white rounded flex items-center justify-center border border-gray-200">
        <span className="text-black text-xs font-semibold">Pay</span>
      </div>
      
      {/* Google Pay */}
      <div className="w-12 h-8 bg-white rounded flex items-center justify-center border border-gray-200">
        <span className="text-xs">
          <span className="text-blue-500">G</span>
          <span className="text-red-500">o</span>
          <span className="text-yellow-500">o</span>
          <span className="text-blue-500">g</span>
          <span className="text-green-500">l</span>
          <span className="text-red-500">e</span>
        </span>
      </div>
      
      {/* Visa */}
      <div className="w-12 h-8 bg-white rounded flex items-center justify-center border border-gray-200">
        <span className="text-blue-900 font-bold italic text-xs">VISA</span>
      </div>
      
      {/* Mastercard */}
      <div className="w-12 h-8 bg-white rounded flex items-center justify-center border border-gray-200 relative overflow-hidden">
        <div className="absolute left-2 w-4 h-4 bg-red-500 rounded-full opacity-80"></div>
        <div className="absolute right-2 w-4 h-4 bg-yellow-500 rounded-full opacity-80"></div>
      </div>
      
      {/* Amex */}
      <div className="w-12 h-8 bg-blue-500 rounded flex items-center justify-center">
        <span className="text-white text-[10px] font-bold">AMEX</span>
      </div>
      
      {/* Discover */}
      <div className="w-12 h-8 bg-white rounded flex items-center justify-center border border-gray-200">
        <span className="text-orange-500 font-bold text-xs">D</span>
      </div>
      
      {/* JCB */}
      <div className="w-12 h-8 bg-white rounded flex items-center justify-center border border-gray-200 flex gap-0.5">
        <div className="w-2 h-5 bg-blue-600 rounded-l"></div>
        <div className="w-2 h-5 bg-red-600"></div>
        <div className="w-2 h-5 bg-green-600 rounded-r"></div>
      </div>
    </div>
  );
}
