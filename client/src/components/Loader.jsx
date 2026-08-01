const Loader = ({ label = 'Loading...' }) => {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4 py-10">
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
        {label}
      </div>
    </div>
  )
}

export default Loader
