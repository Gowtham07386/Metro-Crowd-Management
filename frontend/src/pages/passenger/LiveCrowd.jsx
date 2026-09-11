import { useApp } from "@/context/AppContext";

import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Users,
    Clock
} from "lucide-react";

import Card from "@/components/common/Card";

import SearchBar from "@/components/common/SearchBar";

import Badge, {
    statusToTone,
} from "@/components/common/Badge";

import StationDetailModal
    from "@/components/passenger/StationDetailModal";

import {
    getStations
} from "@/services/metroflowApi";
import { generateCityData } from "@/data/cityDataGenerator";

const getOccupancyGradient = (occupancy) => {
    const val = Number(occupancy || 0);
    if (val >= 85) return 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
    if (val >= 65) return 'linear-gradient(90deg, #f97316 0%, #ea580c 100%)';
    if (val >= 40) return 'linear-gradient(90deg, #eab308 0%, #f59e0b 100%)';
    return 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
};


export default function LiveCrowd() {

    // ========================================================
    // APP CONTEXT
    // ========================================================

    const {
        cityId,
        city
    } = useApp();


    // ========================================================
    // STATE
    // ========================================================

    const [
        stations,
        setStations
    ] = useState([]);

    const [
        query,
        setQuery
    ] = useState("");

    const [
        activeStation,
        setActiveStation
    ] = useState(null);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState(null);


    // ========================================================
    // CITY MAPPING
    // ========================================================

    const backendCityMap = {
        delhi: "Delhi",
        hyderabad: "Hyderabad",
        bengaluru: "Bengaluru",
        bangalore: "Bengaluru",
        mumbai: "Mumbai",
        chennai: "Chennai",
        kolkata: "Kolkata",
        lucknow: "Lucknow",
        jaipur: "Jaipur",
        kochi: "Kochi",
        pune: "Pune",
    };


    // ========================================================
    // SELECTED CITY
    // ========================================================

    const selectedCity = useMemo(() => {
        const cid = (cityId || "delhi").toLowerCase();
        if (backendCityMap[cid]) {
            return backendCityMap[cid];
        }
        if (city?.name) {
            return city.name.replace(/\s+Metro$/i, "");
        }
        return "Delhi";
    }, [
        cityId,
        city
    ]);


    // ========================================================
    // LOAD STATIONS
    // ========================================================

    useEffect(() => {
        let cancelled = false;

        const loadStations = async () => {
            const currentCityId = (cityId || "delhi").toLowerCase();

            try {
                setLoading(true);
                setError(null);

                const fallbackData = generateCityData(currentCityId);
                const masterStations = fallbackData?.stations || [];

                let loadedStations = [];
                try {
                    const response = await getStations(currentCityId);
                    if (Array.isArray(response)) {
                        loadedStations = response;
                    } else if (response && Array.isArray(response.stations)) {
                        loadedStations = response.stations;
                    }
                } catch (apiErr) {
                    console.warn("Backend stations API unreachable, using local master dataset:", apiErr);
                }

                if (cancelled) return;

                if (masterStations.length > 0) {
                    // Map backend real-time values to master stations dataset so no station is omitted
                    const loadedMap = new Map();
                    loadedStations.forEach((s) => {
                        if (s.id) loadedMap.set(String(s.id).toUpperCase(), s);
                        if (s.name) loadedMap.set(s.name.toLowerCase().trim(), s);
                    });

                    const mergedStations = masterStations.map((masterSt) => {
                        const backendSt = loadedMap.get(String(masterSt.id).toUpperCase()) || loadedMap.get(masterSt.name.toLowerCase().trim());
                        if (backendSt) {
                            return {
                                ...masterSt,
                                ...backendSt,
                                id: masterSt.id,
                                name: masterSt.name,
                                line: masterSt.line || backendSt.line,
                                lineColor: masterSt.lineColor || backendSt.lineColor,
                            };
                        }
                        return masterSt;
                    });

                    setStations(mergedStations);
                } else if (loadedStations.length > 0) {
                    setStations(loadedStations);
                } else {
                    setError(`No station data was returned for ${selectedCity}.`);
                }
            } catch (err) {
                if (cancelled) return;
                console.warn("Failed to load stations:", err);
                const fallbackData = generateCityData(currentCityId);
                if (fallbackData?.stations?.length) {
                    setStations(fallbackData.stations);
                } else {
                    setError(`Unable to load ${selectedCity} station data.`);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadStations();

        const pollTimer = setInterval(loadStations, 300000); // Refresh every 5 minutes

        return () => {
            cancelled = true;
            clearInterval(pollTimer);
        };
    }, [
        selectedCity,
        cityId
    ]);



    // ========================================================
    // SEARCH FILTER
    // ========================================================

    const filtered = useMemo(() => {

        const search =
            query
                .toLowerCase()
                .trim();


        if (!search) {

            return stations;

        }


        return stations.filter(
            (station) => {

                const name =
                    station.name
                        ?.toLowerCase() || "";


                const id =
                    station.id
                        ?.toLowerCase() || "";


                const line =
                    station.line
                        ?.toLowerCase() || "";


                return (
                    name.includes(search) ||
                    id.includes(search) ||
                    line.includes(search)
                );

            }
        );

    }, [
        stations,
        query
    ]);


    // ========================================================
    // CROWD SUMMARY
    // ========================================================
    //
    // IMPORTANT:
    // This uses ALL stations, not the search-filtered list.
    //
    // Therefore searching for one station does not change
    // the overall city crowd summary.
    //
    // ========================================================

    const crowdSummary = useMemo(() => {

        let low = 0;

        let moderate = 0;

        let high = 0;

        let totalOccupancy = 0;


        stations.forEach(
            (station) => {

                const status =
                    String(
                        station.status || ""
                    ).toLowerCase();


                const occupancy =
                    Number(
                        station.occupancy || 0
                    );


                totalOccupancy +=
                    Number.isFinite(
                        occupancy
                    )
                        ? occupancy
                        : 0;


                // ------------------------------
                // LOW
                // ------------------------------

                if (
                    status === "smooth" ||
                    status === "low"
                ) {

                    low++;

                }


                // ------------------------------
                // MODERATE
                // ------------------------------

                else if (
                    status === "moderate" ||
                    status === "medium"
                ) {

                    moderate++;

                }


                // ------------------------------
                // HIGH
                // ------------------------------

                else if (
                    status === "busy" ||
                    status === "high"
                ) {

                    high++;

                }


                // ------------------------------
                // FALLBACK
                // ------------------------------
                //
                // If backend status is unavailable,
                // classify using occupancy.
                //

                else {

                    if (occupancy < 40) {

                        low++;

                    }

                    else if (
                        occupancy < 70
                    ) {

                        moderate++;

                    }

                    else {

                        high++;

                    }

                }

            }
        );


        const averageOccupancy =
            stations.length > 0
                ? totalOccupancy /
                  stations.length
                : 0;


        return {

            low,

            moderate,

            high,

            averageOccupancy,

        };

    }, [
        stations
    ]);


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div
                className="
                    flex
                    min-h-[300px]
                    items-center
                    justify-center
                "
            >

                <p
                    className="
                        text-slate-400
                    "
                >

                    Loading{" "}

                    {selectedCity || "metro"}{" "}

                    station data...

                </p>

            </div>

        );

    }


    // ========================================================
    // ERROR
    // ========================================================

    if (error) {

        return (

            <div
                className="
                    rounded-xl
                    border
                    border-red-500/30
                    bg-red-500/10
                    p-6
                "
            >

                <p
                    className="
                        font-medium
                        text-red-400
                    "
                >

                    {error}

                </p>


                <p
                    className="
                        mt-2
                        text-sm
                        text-slate-400
                    "
                >

                    Make sure the FastAPI
                    backend is running on

                    {" "}

                    http://127.0.0.1:8000

                </p>

            </div>

        );

    }


    // ========================================================
    // UI
    // ========================================================

    return (

        <div>

            {/* =================================================
                HEADER
                ================================================= */}

            <div
                className="mb-6"
            >

                <h1
                    className="
                        font-display
                        text-2xl
                        font-bold
                        text-slate-900
                        dark:text-white
                    "
                >

                    Live Crowd Status

                </h1>


                <p
                    className="
                        mt-1
                        text-sm
                        text-slate-500
                        dark:text-slate-400
                    "
                >

                    Real-time occupancy
                    across{" "}

                    {selectedCity}{" "}

                    metro stations.

                </p>

            </div>


            {/* =================================================
                CITY
                ================================================= */}

            <div
                className="
                    mb-4
                    text-sm
                    text-slate-500
                "
            >

                City:

                <span
                    className="
                        ml-1
                        font-semibold
                        text-slate-700
                        dark:text-slate-200
                    "
                >

                    {selectedCity}

                </span>

            </div>


            {/* =================================================
                SEARCH
                ================================================= */}

            <div
                className="mb-6"
            >

                <SearchBar

                    value={query}

                    onChange={setQuery}

                    placeholder={
                        `Search ${selectedCity} station...`
                    }

                />

            </div>


            {/* =================================================
                CROWD SUMMARY
                ================================================= */}

            <div
                className="mb-6"
            >

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-4
                        sm:grid-cols-2
                        lg:grid-cols-4
                    "
                >

                    {/* ==========================================
                        TOTAL STATIONS
                        ========================================== */}

                    <div
                        className="
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            p-4
                            shadow-sm
                            dark:border-slate-700
                            dark:bg-slate-900
                        "
                    >

                        <p
                            className="
                                text-sm
                                text-slate-500
                                dark:text-slate-400
                            "
                        >

                            Total Stations

                        </p>


                        <p
                            className="
                                mt-1
                                text-2xl
                                font-bold
                                text-slate-900
                                dark:text-white
                            "
                        >

                            {stations.length}

                        </p>


                        <p
                            className="
                                mt-1
                                text-xs
                                text-slate-400
                            "
                        >

                            {selectedCity} Metro

                        </p>

                    </div>


                    {/* ==========================================
                        LOW
                        ========================================== */}

                    <div
                        className="
                            rounded-xl
                            border
                            border-emerald-200
                            bg-emerald-50
                            p-4
                            dark:border-emerald-900/40
                            dark:bg-emerald-950/20
                        "
                    >

                        <p
                            className="
                                text-sm
                                text-emerald-700
                                dark:text-emerald-400
                            "
                        >

                            Low Crowd

                        </p>


                        <p
                            className="
                                mt-1
                                text-2xl
                                font-bold
                                text-emerald-700
                                dark:text-emerald-400
                            "
                        >

                            {crowdSummary.low}

                        </p>


                        <p
                            className="
                                mt-1
                                text-xs
                                text-emerald-600
                                dark:text-emerald-500
                            "
                        >

                            Smooth stations

                        </p>

                    </div>


                    {/* ==========================================
                        MODERATE
                        ========================================== */}

                    <div
                        className="
                            rounded-xl
                            border
                            border-amber-200
                            bg-amber-50
                            p-4
                            dark:border-amber-900/40
                            dark:bg-amber-950/20
                        "
                    >

                        <p
                            className="
                                text-sm
                                text-amber-700
                                dark:text-amber-400
                            "
                        >

                            Moderate Crowd

                        </p>


                        <p
                            className="
                                mt-1
                                text-2xl
                                font-bold
                                text-amber-700
                                dark:text-amber-400
                            "
                        >

                            {crowdSummary.moderate}

                        </p>


                        <p
                            className="
                                mt-1
                                text-xs
                                text-amber-600
                                dark:text-amber-500
                            "
                        >

                            Moderate stations

                        </p>

                    </div>


                    {/* ==========================================
                        HIGH
                        ========================================== */}

                    <div
                        className="
                            rounded-xl
                            border
                            border-red-200
                            bg-red-50
                            p-4
                            dark:border-red-900/40
                            dark:bg-red-950/20
                        "
                    >

                        <p
                            className="
                                text-sm
                                text-red-700
                                dark:text-red-400
                            "
                        >

                            High Crowd

                        </p>


                        <p
                            className="
                                mt-1
                                text-2xl
                                font-bold
                                text-red-700
                                dark:text-red-400
                            "
                        >

                            {crowdSummary.high}

                        </p>


                        <p
                            className="
                                mt-1
                                text-xs
                                text-red-600
                                dark:text-red-500
                            "
                        >

                            Busy stations

                        </p>

                    </div>

                </div>


                {/* ==============================================
                    AVERAGE OCCUPANCY
                    ============================================== */}

                <div
                    className="
                        mt-4
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        p-4
                        shadow-sm
                        dark:border-slate-700
                        dark:bg-slate-900
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                        "
                    >

                        <div>

                            <p
                                className="
                                    text-sm
                                    text-slate-500
                                    dark:text-slate-400
                                "
                            >

                                Average Metro Occupancy

                            </p>


                            <p
                                className="
                                    mt-1
                                    text-2xl
                                    font-bold
                                    text-slate-900
                                    dark:text-white
                                "
                            >

                                {
                                    crowdSummary
                                        .averageOccupancy
                                        .toFixed(2)
                                }%

                            </p>

                        </div>


                        <div
                            className="text-right"
                        >

                            <p
                                className="
                                    text-xs
                                    text-slate-400
                                "
                            >

                                Across all{" "}

                                {selectedCity}{" "}

                                stations

                            </p>

                        </div>

                    </div>


                    {/* ==========================================
                        AVERAGE OCCUPANCY BAR
                        ========================================== */}

                    <div
                        className="
                            mt-3
                            h-2
                            w-full
                            overflow-hidden
                            rounded-full
                            bg-slate-100
                            dark:bg-slate-800
                        "
                    >

                        <div

                            className="
                                h-full
                                rounded-full
                                transition-all
                                duration-700
                            "

                            style={{
                                width:
                                    `${Math.min(
                                        100,
                                        Math.max(
                                            0,
                                            crowdSummary
                                                .averageOccupancy
                                        )
                                    )}%`,
                                background: getOccupancyGradient(crowdSummary.averageOccupancy),
                            }}

                        />

                    </div>

                </div>

            </div>


            {/* =================================================
                STATION COUNT
                ================================================= */}

            <div
                className="
                    mb-4
                    text-sm
                    text-slate-500
                "
            >

                Showing{" "}

                <span
                    className="
                        font-semibold
                    "
                >

                    {filtered.length}

                </span>{" "}

                of{" "}

                <span
                    className="
                        font-semibold
                    "
                >

                    {stations.length}

                </span>{" "}

                {selectedCity} stations

            </div>


            {/* =================================================
                STATIONS
                ================================================= */}

            {filtered.length === 0 ? (

                <div
                    className="
                        rounded-xl
                        border
                        border-slate-200
                        p-8
                        text-center
                    "
                >

                    <p
                        className="
                            text-slate-500
                        "
                    >

                        No {selectedCity}
                        stations found.

                    </p>

                </div>

            ) : (

                <div
                    className="
                        grid
                        grid-cols-1
                        gap-4
                        sm:grid-cols-2
                        lg:grid-cols-3
                    "
                >

                    {filtered.map(
                        (station) => (

                            <button

                                key={
                                    station.id
                                }

                                onClick={() =>
                                    setActiveStation(
                                        station
                                    )
                                }

                                className="
                                    text-left
                                "
                            >

                                <Card

                                    hover

                                    animate={false}

                                    className="
                                        h-full
                                    "
                                >

                                    {/* =================================
                                        STATION HEADER
                                        ================================= */}

                                    <div
                                        className="
                                            flex
                                            items-start
                                            justify-between
                                        "
                                    >

                                        <div>

                                            <p
                                                className="
                                                    font-display
                                                    text-base
                                                    font-bold
                                                    text-slate-900
                                                    dark:text-white
                                                "
                                            >

                                                {
                                                    station.name
                                                }

                                            </p>


                                            <p
                                                className="
                                                    text-xs
                                                    text-slate-400
                                                "
                                            >

                                                {
                                                    station.line
                                                }

                                            </p>

                                        </div>


                                        <Badge

                                            tone={
                                                statusToTone(
                                                    station.status
                                                )
                                            }

                                        >

                                            {
                                                station.statusLabel
                                            }

                                        </Badge>

                                    </div>


                                    {/* =================================
                                        OCCUPANCY
                                        ================================= */}

                                    <div
                                        className="
                                            mt-4
                                        "
                                    >

                                        <div
                                            className="
                                                mb-1
                                                flex
                                                items-center
                                                justify-between
                                                text-xs
                                                text-slate-400
                                            "
                                        >

                                            <span>

                                                Occupancy

                                            </span>


                                            <span>

                                                {
                                                    Number(
                                                        station.occupancy || 0
                                                    ).toFixed(2)
                                                }%

                                            </span>

                                        </div>


                                        <div
                                            className="
                                                h-2
                                                w-full
                                                overflow-hidden
                                                rounded-full
                                                bg-slate-100
                                            "
                                        >

                                            <div

                                                className="
                                                    h-full
                                                    rounded-full
                                                    transition-all
                                                    duration-700
                                                "

                                                style={{
                                                    width:
                                                        `${Math.min(
                                                            100,
                                                            Math.max(
                                                                0,
                                                                Number(
                                                                    station.occupancy || 0
                                                                )
                                                            )
                                                        )}%`,
                                                    background: getOccupancyGradient(station.occupancy),
                                                }}

                                            />

                                        </div>

                                    </div>


                                    {/* =================================
                                        CROWD + WAITING TIME
                                        ================================= */}

                                    <div
                                        className="
                                            mt-4
                                            flex
                                            items-center
                                            justify-between
                                            text-xs
                                            text-slate-500
                                        "
                                    >

                                        <span
                                            className="
                                                flex
                                                items-center
                                                gap-1.5
                                            "
                                        >

                                            <Users
                                                className="
                                                    h-3.5
                                                    w-3.5
                                                "
                                            />


                                            {
                                                Number(
                                                    station.currentCrowd || 0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )
                                            }

                                        </span>


                                        <span
                                            className="
                                                flex
                                                items-center
                                                gap-1.5
                                            "
                                        >

                                            <Clock
                                                className="
                                                    h-3.5
                                                    w-3.5
                                                "
                                            />


                                            {
                                                station.waitingTime ?? 0
                                            }

                                            {" "}min wait

                                        </span>

                                    </div>


                                    {/* =================================
                                        STATION ID
                                        ================================= */}

                                    <div
                                        className="
                                            mt-3
                                            text-[10px]
                                            text-slate-400
                                        "
                                    >

                                        Station ID:

                                        {" "}

                                        {
                                            station.id
                                        }

                                    </div>

                                </Card>

                            </button>

                        )
                    )}

                </div>

            )}


            {/* =================================================
                DETAIL MODAL
                ================================================= */}

            <StationDetailModal

                station={
                    activeStation
                }

                isOpen={
                    Boolean(
                        activeStation
                    )
                }

                onClose={() =>
                    setActiveStation(null)
                }

            />

        </div>

    );

}