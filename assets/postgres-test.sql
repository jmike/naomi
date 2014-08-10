--
-- PostgreSQL database dump
--

-- Dumped from database version 9.3.5
-- Dumped by pg_dump version 9.3.1
-- Started on 2014-08-10 10:05:00 EEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TOC entry 2277 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: jmike
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- TOC entry 180 (class 3079 OID 12018)
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";


--
-- TOC entry 2279 (class 0 OID 0)
-- Dependencies: 180
-- Name: EXTENSION "plpgsql"; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION "plpgsql" IS 'PL/pgSQL procedural language';


--
-- TOC entry 181 (class 3079 OID 16393)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "public";


--
-- TOC entry 2280 (class 0 OID 0)
-- Dependencies: 181
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET search_path = "public", pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- TOC entry 177 (class 1259 OID 16478)
-- Name: companies; Type: TABLE; Schema: public; Owner: jmike; Tablespace:
--

CREATE TABLE "companies" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "country_id" integer NOT NULL
);


ALTER TABLE "public"."companies" OWNER TO "jmike";

--
-- TOC entry 176 (class 1259 OID 16476)
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: jmike
--

CREATE SEQUENCE "companies_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."companies_id_seq" OWNER TO "jmike";

--
-- TOC entry 2281 (class 0 OID 0)
-- Dependencies: 176
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jmike
--

ALTER SEQUENCE "companies_id_seq" OWNED BY "companies"."id";


--
-- TOC entry 178 (class 1259 OID 16490)
-- Name: company_employees; Type: TABLE; Schema: public; Owner: jmike; Tablespace:
--

CREATE TABLE "company_employees" (
    "id" integer NOT NULL,
    "company_id" integer NOT NULL,
    "employee_id" integer NOT NULL
);


ALTER TABLE "public"."company_employees" OWNER TO "jmike";

--
-- TOC entry 179 (class 1259 OID 16493)
-- Name: company_employees_id_seq; Type: SEQUENCE; Schema: public; Owner: jmike
--

CREATE SEQUENCE "company_employees_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."company_employees_id_seq" OWNER TO "jmike";

--
-- TOC entry 2282 (class 0 OID 0)
-- Dependencies: 179
-- Name: company_employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jmike
--

ALTER SEQUENCE "company_employees_id_seq" OWNED BY "company_employees"."id";


--
-- TOC entry 175 (class 1259 OID 16435)
-- Name: countries; Type: TABLE; Schema: public; Owner: jmike; Tablespace:
--

CREATE TABLE "countries" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL,
    "region_id" integer NOT NULL
);


ALTER TABLE "public"."countries" OWNER TO "jmike";

--
-- TOC entry 174 (class 1259 OID 16433)
-- Name: countries_id_seq; Type: SEQUENCE; Schema: public; Owner: jmike
--

CREATE SEQUENCE "countries_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."countries_id_seq" OWNER TO "jmike";

--
-- TOC entry 2283 (class 0 OID 0)
-- Dependencies: 174
-- Name: countries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jmike
--

ALTER SEQUENCE "countries_id_seq" OWNED BY "countries"."id";


--
-- TOC entry 170 (class 1259 OID 16404)
-- Name: employees; Type: TABLE; Schema: public; Owner: jmike; Tablespace:
--

CREATE TABLE "employees" (
    "id" integer NOT NULL,
    "firstname" character varying(45) NOT NULL,
    "lastname" character varying(45) NOT NULL,
    "age" smallint,
    "country_id" integer NOT NULL
);


ALTER TABLE "public"."employees" OWNER TO "jmike";

--
-- TOC entry 171 (class 1259 OID 16412)
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: jmike
--

CREATE SEQUENCE "employees_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."employees_id_seq" OWNER TO "jmike";

--
-- TOC entry 2284 (class 0 OID 0)
-- Dependencies: 171
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jmike
--

ALTER SEQUENCE "employees_id_seq" OWNED BY "employees"."id";


--
-- TOC entry 173 (class 1259 OID 16425)
-- Name: regions; Type: TABLE; Schema: public; Owner: jmike; Tablespace:
--

CREATE TABLE "regions" (
    "id" integer NOT NULL,
    "name" character varying(100) NOT NULL
);


ALTER TABLE "public"."regions" OWNER TO "jmike";

--
-- TOC entry 172 (class 1259 OID 16423)
-- Name: regions_id_seq; Type: SEQUENCE; Schema: public; Owner: jmike
--

CREATE SEQUENCE "regions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."regions_id_seq" OWNER TO "jmike";

--
-- TOC entry 2285 (class 0 OID 0)
-- Dependencies: 172
-- Name: regions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jmike
--

ALTER SEQUENCE "regions_id_seq" OWNED BY "regions"."id";


--
-- TOC entry 2127 (class 2604 OID 16513)
-- Name: id; Type: DEFAULT; Schema: public; Owner: jmike
--

ALTER TABLE ONLY "companies" ALTER COLUMN "id" SET DEFAULT "nextval"('"companies_id_seq"'::"regclass");


--
-- TOC entry 2128 (class 2604 OID 16514)
-- Name: id; Type: DEFAULT; Schema: public; Owner: jmike
--

ALTER TABLE ONLY "company_employees" ALTER COLUMN "id" SET DEFAULT "nextval"('"company_employees_id_seq"'::"regclass");


--
-- TOC entry 2126 (class 2604 OID 16515)
-- Name: id; Type: DEFAULT; Schema: public; Owner: jmike
--

ALTER TABLE ONLY "countries" ALTER COLUMN "id" SET DEFAULT "nextval"('"countries_id_seq"'::"regclass");


--
-- TOC entry 2124 (class 2604 OID 16516)
-- Name: id; Type: DEFAULT; Schema: public; Owner: jmike
--

ALTER TABLE ONLY "employees" ALTER COLUMN "id" SET DEFAULT "nextval"('"employees_id_seq"'::"regclass");


--
-- TOC entry 2125 (class 2604 OID 16517)
-- Name: id; Type: DEFAULT; Schema: public; Owner: jmike
--

ALTER TABLE ONLY "regions" ALTER COLUMN "id" SET DEFAULT "nextval"('"regions_id_seq"'::"regclass");


--
-- TOC entry 2269 (class 0 OID 16478)
-- Dependencies: 177
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: jmike
--

INSERT INTO "companies" VALUES (1, 'Stratton Oakmont', 1);


--
-- TOC entry 2286 (class 0 OID 0)
-- Dependencies: 176
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jmike
--

SELECT pg_catalog.setval('"companies_id_seq"', 1, true);


--
-- TOC entry 2270 (class 0 OID 16490)
-- Dependencies: 178
-- Data for Name: company_employees; Type: TABLE DATA; Schema: public; Owner: jmike
--

INSERT INTO "company_employees" VALUES (1, 1, 1);


--
-- TOC entry 2287 (class 0 OID 0)
-- Dependencies: 179
-- Name: company_employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jmike
--

SELECT pg_catalog.setval('"company_employees_id_seq"', 1, true);


--
-- TOC entry 2267 (class 0 OID 16435)
-- Dependencies: 175
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: jmike
--

INSERT INTO "countries" VALUES (1, 'USA', 1);


--
-- TOC entry 2288 (class 0 OID 0)
-- Dependencies: 174
-- Name: countries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jmike
--

SELECT pg_catalog.setval('"countries_id_seq"', 2, true);


--
-- TOC entry 2262 (class 0 OID 16404)
-- Dependencies: 170
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: jmike
--

INSERT INTO "employees" VALUES (1, 'Jordan', 'Belfort', 38, 1);


--
-- TOC entry 2289 (class 0 OID 0)
-- Dependencies: 171
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jmike
--

SELECT pg_catalog.setval('"employees_id_seq"', 1, true);


--
-- TOC entry 2265 (class 0 OID 16425)
-- Dependencies: 173
-- Data for Name: regions; Type: TABLE DATA; Schema: public; Owner: jmike
--

INSERT INTO "regions" VALUES (1, 'North America');


--
-- TOC entry 2290 (class 0 OID 0)
-- Dependencies: 172
-- Name: regions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: jmike
--

SELECT pg_catalog.setval('"regions_id_seq"', 1, true);


--
-- TOC entry 2145 (class 2606 OID 16483)
-- Name: companies_pk; Type: CONSTRAINT; Schema: public; Owner: jmike; Tablespace:
--

ALTER TABLE ONLY "companies"
    ADD CONSTRAINT "companies_pk" PRIMARY KEY ("id");


--
-- TOC entry 2149 (class 2606 OID 16500)
-- Name: company_employees_pk; Type: CONSTRAINT; Schema: public; Owner: jmike; Tablespace:
--

ALTER TABLE ONLY "company_employees"
    ADD CONSTRAINT "company_employees_pk" PRIMARY KEY ("id");


--
-- TOC entry 2139 (class 2606 OID 16442)
-- Name: countries_name_uidx; Type: CONSTRAINT; Schema: public; Owner: jmike; Tablespace:
--

ALTER TABLE ONLY "countries"
    ADD CONSTRAINT "countries_name_uidx" UNIQUE ("name");


--
-- TOC entry 2141 (class 2606 OID 16440)
-- Name: countries_pk; Type: CONSTRAINT; Schema: public; Owner: jmike; Tablespace:
--

ALTER TABLE ONLY "countries"
    ADD CONSTRAINT "countries_pk" PRIMARY KEY ("id");


--
-- TOC entry 2131 (class 2606 OID 16421)
-- Name: employees_name_uidx; Type: CONSTRAINT; Schema: public; Owner: jmike; Tablespace:
--

ALTER TABLE ONLY "employees"
    ADD CONSTRAINT "employees_name_uidx" UNIQUE ("firstname", "lastname");


--
-- TOC entry 2133 (class 2606 OID 16419)
-- Name: employees_pk; Type: CONSTRAINT; Schema: public; Owner: jmike; Tablespace:
--

ALTER TABLE ONLY "employees"
    ADD CONSTRAINT "employees_pk" PRIMARY KEY ("id");


--
-- TOC entry 2135 (class 2606 OID 16432)
-- Name: regions_name_uidx; Type: CONSTRAINT; Schema: public; Owner: jmike; Tablespace:
--

ALTER TABLE ONLY "regions"
    ADD CONSTRAINT "regions_name_uidx" UNIQUE ("name");


--
-- TOC entry 2137 (class 2606 OID 16430)
-- Name: regions_pk; Type: CONSTRAINT; Schema: public; Owner: jmike; Tablespace:
--

ALTER TABLE ONLY "regions"
    ADD CONSTRAINT "regions_pk" PRIMARY KEY ("id");


--
-- TOC entry 2143 (class 1259 OID 16489)
-- Name: companies_country_id_idx; Type: INDEX; Schema: public; Owner: jmike; Tablespace:
--

CREATE INDEX "companies_country_id_idx" ON "companies" USING "btree" ("country_id");


--
-- TOC entry 2146 (class 1259 OID 16512)
-- Name: company_employees_company_id_idx; Type: INDEX; Schema: public; Owner: jmike; Tablespace:
--

CREATE INDEX "company_employees_company_id_idx" ON "company_employees" USING "btree" ("company_id");


--
-- TOC entry 2147 (class 1259 OID 16511)
-- Name: company_employees_employee_id_idx; Type: INDEX; Schema: public; Owner: jmike; Tablespace:
--

CREATE INDEX "company_employees_employee_id_idx" ON "company_employees" USING "btree" ("employee_id");


--
-- TOC entry 2142 (class 1259 OID 16463)
-- Name: countries_region_id_idx; Type: INDEX; Schema: public; Owner: jmike; Tablespace:
--

CREATE INDEX "countries_region_id_idx" ON "countries" USING "btree" ("region_id");


--
-- TOC entry 2129 (class 1259 OID 16422)
-- Name: employees_age_idx; Type: INDEX; Schema: public; Owner: jmike; Tablespace:
--

CREATE INDEX "employees_age_idx" ON "employees" USING "btree" ("age");


--
-- TOC entry 2152 (class 2606 OID 16484)
-- Name: companies_countries_fk; Type: FK CONSTRAINT; Schema: public; Owner: jmike
--

ALTER TABLE ONLY "companies"
    ADD CONSTRAINT "companies_countries_fk" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2154 (class 2606 OID 16506)
-- Name: company_employees_companies_fk; Type: FK CONSTRAINT; Schema: public; Owner: jmike
--

ALTER TABLE ONLY "company_employees"
    ADD CONSTRAINT "company_employees_companies_fk" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2153 (class 2606 OID 16501)
-- Name: company_employees_employees_fk; Type: FK CONSTRAINT; Schema: public; Owner: jmike
--

ALTER TABLE ONLY "company_employees"
    ADD CONSTRAINT "company_employees_employees_fk" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2151 (class 2606 OID 16458)
-- Name: countries_regions_fk; Type: FK CONSTRAINT; Schema: public; Owner: jmike
--

ALTER TABLE ONLY "countries"
    ADD CONSTRAINT "countries_regions_fk" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2150 (class 2606 OID 16471)
-- Name: employees_countries_fk; Type: FK CONSTRAINT; Schema: public; Owner: jmike
--

ALTER TABLE ONLY "employees"
    ADD CONSTRAINT "employees_countries_fk" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2278 (class 0 OID 0)
-- Dependencies: 6
-- Name: public; Type: ACL; Schema: -; Owner: jmike
--

REVOKE ALL ON SCHEMA "public" FROM PUBLIC;
REVOKE ALL ON SCHEMA "public" FROM "jmike";
GRANT ALL ON SCHEMA "public" TO "jmike";
GRANT ALL ON SCHEMA "public" TO PUBLIC;


-- Completed on 2014-08-10 10:05:01 EEST

--
-- PostgreSQL database dump complete
--

