import React, { useEffect, useState } from "react";
import "./styles.css";

import axios from "axios";

import Header from "../../components/header";
import HeaderDesktop from "../../components/headerDesktop";
import Pagination from "../../components/pagination";

import { useLocation, Link } from "react-router-dom";

import MovieFilter from "../../components/movieFilter";

import { FaFilter } from "react-icons/fa";

import posternotfound from "../../assets/posternotfound.png";

import api from "../../api";

import userImage from '../../assets/user-default.jpg';

const Search = () => {
  const [showImage, setShowImage] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  const { search } = useLocation();

  const params = new URLSearchParams(search);

  const query = params.get("query");
  const user = params.get("user");

  const [beforeQuery, setBeforeQuery] = useState("");
  const [beforeUser, setBeforeUser] = useState("");

  const [movies, setMovies] = useState([]);
  const [users, setUsers] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterWork, setIsFilterWork] = useState(false);

  const [genres, setGenres] = useState([]);
  const [year, setYear] = useState("");
  const [sortby, setSortBy] = useState("");

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 760px)");

    setShowImage(mediaQuery.matches);

    const handleResize = () => {
      setShowImage(mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", handleResize);

    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  let loginItem;
  if (localStorage.getItem('tokenUser')) {
    loginItem = localStorage.getItem('tokenUser').substring(1, localStorage.getItem('tokenUser').length - 1);
  }

  useEffect(() => {
    if (query === null) {
      const fetchData = async () => {
        const headers = {
          Authorization: `Bearer ${loginItem}`,
          "Content-type": "application/json"
        }
        
        const response = await api.get(`/usuarios/search/?nickname=${user}&page=${currentPage}`, { headers });
  
        setUsers(response.data.results.results);
  
        setTotalPages(response.data.results.num_paginas);
      }

      fetchData();
    }else if (user === null) {
      async function fetchData() {
        let response;

        if (isFilterWork) {
          response = await axios.get(
            `https://api.themoviedb.org/3/discover/movie?api_key=91e9bea62105d3ed0765acbbd25020bd&language=pt-BR&with_genres=${genres}&with_text_query=${query}&year=${year}&sort_by=${sortby}&page=${currentPage}`
          );
        } else {
          if (query !== beforeQuery) {
            setCurrentPage(1);
          }

          response = await axios.get(
            `https://api.themoviedb.org/3/search/movie?api_key=91e9bea62105d3ed0765acbbd25020bd&query=${query}&page=${currentPage}&language=pt-BR`
          );
        }

        const results = response.data.results;
        setMovies(results);
        setTotalPages(response.data.total_pages);
        setBeforeQuery(query);
      }

      fetchData();
    }
  }, [
    isFilterWork,
    query,
    currentPage,
    genres,
    year,
    sortby,
    beforeQuery,
    user,
  ]);

  function filterMovies(year, genres, rating) {
    setYear(year);
    setGenres(genres);

    const sortBy = rating === "asc" ? "vote_average.asc" : "vote_average.desc";
    setSortBy(sortBy);

    async function fetchData() {
      const response = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=91e9bea62105d3ed0765acbbd25020bd&language=pt-BR&with_genres=${genres}&with_text_query=${query}&year=${year}&sort_by=${sortBy}&page=${currentPage}`
      );

      setMovies(response.data.results);
      setTotalPages(response.data.total_pages);
      setCurrentPage(1);
    }

    if (year !== "" || genres.length > 0 || rating !== "") {
      setIsFilterWork(true);
      fetchData();
    } else {
      window.location.reload();
      setIsFilterWork(false);
    }
  }

  function handlePageChange(event, pageNumber) {
    event.preventDefault();
    setCurrentPage(pageNumber);
  }

  return (
    <>
      {(window.innerWidth > 760) ?
        <HeaderDesktop />
        :

        <Header />
      }

      <div className="search-container">
        <div className="search-content">
          <div className="search-results">
            {user ? (
              <>
                {users.length > 0 ? (
                  <h2>Resultados da busca por "{user}"</h2>
                ) : (
                  <h2>Não foram encontrados resultados por "{user}"</h2>
                )}

                {users.length > 0 && (<ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
                  {users.map((userData) => (
                    <li key={userData.id}>
                      <Link
                        className="movie-item"
                        to={`/user/${userData.id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <img
                          src={userImage}
                          alt={userData.nickname}
                        />
                        <div className="movie-details">
                          <h3>{userData.nickname}</h3>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>)}

                
                {users.length > 0 && (
                  <Pagination
                    totalPages={totalPages > 5 ? 5 : totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            ) : (
              <>
                {movies.length > 0 ? (
                  <h2>Resultados da busca por "{query}"</h2>
                ) : (
                  <h2>Não foram encontrados resultados por "{query}"</h2>
                )}

                <ul style={{ listStyleType: "none", margin: 0, padding: 0 }}>
                  {movies.map((movie) => (
                    <li key={movie.id}>
                      <Link
                        className="movie-item"
                        to={`/movie/${movie.id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <img
                          src={
                            movie.poster_path
                              ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
                              : posternotfound
                          }
                          alt={movie.title}
                        />
                        <div className="movie-details">
                          <h3>{movie.title}</h3>
                          <p>({new Date(movie.release_date).getFullYear()})</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>

                {movies.length > 0 && (
                  <Pagination
                    totalPages={totalPages > 5 ? 5 : totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </div>

          {user ? (
            null
          ) : (
            <div>
              {showImage && (
                <div className="filter-toggle" onClick={toggleFilter}>
                  <FaFilter /> Filtro
                </div>
              )}

              {(!showImage || (showImage && showFilter)) && (
                <MovieFilter filterMovies={filterMovies} />
              )}
            </div>
          )}


        </div>
      </div>
    </>
  );
};

export default Search;
