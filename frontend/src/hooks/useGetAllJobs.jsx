import { setAllJobs } from '@/redux/jobSlice';
import { JOB_API_END_POINT } from '@/utils/constant.jsx';
import axios from 'axios';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function useGetAllJobs() {
    const dispatch = useDispatch();
    const { searchedQuery } = useSelector((state) => state.job);

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                const trimmedQuery = searchedQuery.trim();
                const url = trimmedQuery
                    ? `${JOB_API_END_POINT}/get?keyword=${trimmedQuery}`
                    : `${JOB_API_END_POINT}/get`;

                const res = await axios.get(url, { withCredentials: true });

                if (res.data.success) {
                    dispatch(setAllJobs(res.data.jobs));
                } else {
                    dispatch(setAllJobs([]));
                }
            } catch (error) {
                console.error("Error fetching jobs:", error.message);
                dispatch(setAllJobs([]));
            }
        };

        fetchAllJobs();
    }, [searchedQuery]);
}

export default useGetAllJobs;
