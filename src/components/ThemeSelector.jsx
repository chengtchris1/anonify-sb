const ThemeSelector = ({ theme, setTheme }) => {
  const currentTheme = Object.keys(theme).find((key) => theme[key]);
  return (
    <div className='dropdown dropdown-hover'>
      <div tabIndex={0} role='button' className='btn btn-xs btn-primary'>
        <span>
          Theme:{" "}
          {currentTheme
            ? currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)
            : "Dark"}
        </span>
      </div>
      <ul
        tabIndex={0}
        className='dropdown-content z-[1] menu p-2 shadow bg-primary-content text-primary rounded-box w-52'
      >
        {Object.keys(theme).map((themeName) => (
          <li>
            <a
              className={`${
                themeName === currentTheme
                  ? "bg-secondary-content text-secondary"
                  : "bg-transparent text-primary"
              }`}
              onClick={() => {
                setTheme(themeName);
              }}
            >
              {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default ThemeSelector;
