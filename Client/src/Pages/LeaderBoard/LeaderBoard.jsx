import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getStudentData } from "../../Redux/student/action";

//component imports
import Navbar from "../../Components/Sidebar/Navbar";
import Header from "../../Components/Header/Header";
import LeaderboardRow from "../../Components/Table/LeaderboardRow";

//css imports
import "./LeaderBoard.css";

const LeaderBoard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filterLeaderboard, setFilterLeaderboard] = useState('');

  //redux states
  const {
    data: { isAuthenticated },
  } = useSelector((store) => store.auth);
  const { students } = useSelector((store) => store.student);

  useEffect(() => {
    dispatch(getStudentData(filterLeaderboard));
  }, [filterLeaderboard]);

  useEffect(() => {
    if (!isAuthenticated) {
      return navigate("/");
    }
  }, []);

  return (
    <Navbar>
      {/* header  */}
      <div className="leaderboard">
        <Header Title={"Ranking"} Address={"Leaderboard"} />
      </div>

      {/* Filter by Class */}
      <select style={{ width: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 'auto', marginTop: '20px', marginBottom: '10px' }} value={filterLeaderboard} onChange={(e) => setFilterLeaderboard(e.target.value)}>
        <option value="">Filter by Class</option>
        <option value={5}>5</option>
        <option value={6}>6</option>
        <option value={7}>7</option>
        <option value={8}>8</option>
        <option value={9}>9</option>
        <option value={10}>10</option>
      </select>

      <div className="leaderboardData">
        {/* table */}
        <section className="tableBody">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Class</th>
                <th>Quiz attended</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {students
                .sort((a, b) => (b.totalPoints - a.totalPoints))
                .map((data, i) => (
                  <LeaderboardRow key={i} data={data} />
                ))}
            </tbody>
          </table>
        </section>
      </div>
    </Navbar>
  );
};

export default LeaderBoard;
