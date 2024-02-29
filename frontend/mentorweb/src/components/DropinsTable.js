import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { formatTime, formatDate, getDayFromDate, capitalizeFirstLetter } from '../utils/FormatDatetime';
import { getCookie } from '../utils/GetCookie';

export default function DropinsTable({ courseId }) {
    const { user } = useContext(UserContext);
    const [data, setData] = useState([]);
    const [showTable, setShowTable] = useState(true);
    const [sortedBy, sortBy] = useState('Type');
    const [hoveringDateOrTime, setHoveringDateOrTime] = useState(false);

    const fetchDropins = async () => {
        if (!user) return;

        try {
            const response = await fetch(`/student/dropins/${encodeURIComponent(courseId)}`, {
                credentials: 'include',
            });

            const apiData = await response.json();

            if (apiData.length > 1) {
                const sortedData = (apiData || []).sort((a, b) => {
                    const dateComparison = new Date(a.date) - new Date(b.date);
                    if (dateComparison === 0) {
                        return (
                            new Date(`${a.date}T${a.start_time}`) -
                            new Date(`${b.date}T${b.start_time}`)
                        );
                    }
                    return dateComparison;
                });
                setData(sortedData);
            } else {
                setData(apiData);
            }


        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    useEffect(() => {
        fetchDropins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (courseId !== null || courseId !== '') {
            fetchDropins();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const sortTable = (sort) => {
        const daysOfWeekOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

        const sortedData = [...data].sort((a, b) => {
            switch (sort) {
                case 'Type':
                    return a.type.localeCompare(b.type);
                case 'Day':
                    return daysOfWeekOrder.indexOf(getDayFromDate(a.date)) - daysOfWeekOrder.indexOf(getDayFromDate(b.date));
                case 'Date':
                    const dateComparison = new Date(a.date) - new Date(b.date);
                    if (dateComparison === 0) {
                        return (
                            new Date(`${a.date}T${a.start_time}`) -
                            new Date(`${b.date}T${b.start_time}`)
                        );
                    }
                    return dateComparison;
                case 'Status':
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });
      
        setData(sortedData);
    };

    useEffect(() => {
        sortTable(sortedBy);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortedBy]);

    

    return (
        <div className="w-full m-auto">
            <div className='text-center font-bold text-2xl pb-5'>
                <h1>Drop Ins Times</h1>
            </div>
            <button
                className="font-bold border border-light-gray rounded-md shadow-md text-sm px-3 py-1 mb-2"
                onClick={() => setShowTable(!showTable)}
            >
            {showTable ? 'Hide Table' : 'Show Table'}
            </button>
      
          <div className="border w-3/8 m-auto text-center">
            <table className='w-full'>
              <thead className='border-b border-light-gray bg-purple text-white'>
                <th className='border-r border-light-gray w-14% cursor-pointer hover:bg-gold' onClick={() => sortBy("Type")}>Type</th>
                <th className='border-r border-light-gray w-8% cursor-pointer hover:bg-gold' onClick={() => sortBy("Day")}>Day</th>
                <th className={`border-r border-light-gray w-12% cursor-pointer ${hoveringDateOrTime ? 'bg-gold' : '' }`} onClick={() => sortBy("Date")} onMouseEnter={() => setHoveringDateOrTime(true)} onMouseLeave={() => setHoveringDateOrTime(false)}>Date</th>
                <th className={`border-r border-light-gray w-12% cursor-pointer ${hoveringDateOrTime ? 'bg-gold' : '' }`} onClick={() => sortBy("Date")} onMouseEnter={() => setHoveringDateOrTime(true)} onMouseLeave={() => setHoveringDateOrTime(false)}>Time (PST)</th>
              </thead>
              <tbody>
                {showTable && data.map((availability) => (
                  <tr className='border' key={availability.id}>
                        <td className='border-r'>{availability.type}</td>
                        <td className='border-r'>{getDayFromDate(availability.date)}</td>
                        <td className='border-r'>{formatDate(availability.date)}</td>
                        <td className='border-r'>{formatTime(availability.start_time)} - {formatTime(availability.end_time)} </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
      
}