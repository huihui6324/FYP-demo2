import { useNavigate } from 'react-router-dom'
import './Welcome.css'

function Welcome() {
  const navigate = useNavigate()

  const handleEnter = () => {
    navigate('/map')
  }

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1>歡迎</h1>
        <p>探索互動式地圖</p>
        <button className="enter-button" onClick={handleEnter}>
          進入
        </button>
      </div>
    </div>
  )
}

export default Welcome
