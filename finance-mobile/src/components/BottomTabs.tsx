import { NavLink } from "react-router-dom";

export default function BottomTabs(){
  const items = [
    { to:"/", label:"Home", icon:"🏠" },
    { to:"/transactions", label:"Transaksi", icon:"💳" },
    { to:"/accounts", label:"Akun", icon:"🏦" },
    { to:"/categories", label:"Kategori", icon:"🏷️" },
    { to:"/budgets", label:"Budget", icon:"📊" }
  ];
  return (
    <div className="tabs">
      {items.map(it=>(
        <NavLink key={it.to} to={it.to} className={({isActive})=> "tab"+(isActive?" active":"")}>
          <span className="i">{it.icon}</span>
          <span className="t">{it.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
