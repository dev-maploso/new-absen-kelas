import { defineStore } from "pinia";

import pembayaranService from "@/services/pembayaran.service";

import type {
  PembayaranMahasantri,
} from "@/types/pembayaran";


interface PembayaranState {

  loading: boolean;

  loadingDetail: boolean;


  // hasil search
  items: PembayaranMahasantri[];


  // detail terpilih
  detail: PembayaranMahasantri | null;


  keyword: string;

}


export const usePembayaranStore = defineStore("pembayaran", {

  state: (): PembayaranState => ({

    loading: false,

    loadingDetail: false,


    items: [],

    detail: null,


    keyword: "",

  }),



  getters: {


    hasResult(state) {
      return state.items.length > 0;
    },


    hasDetail(state) {
      return !!state.detail;
    },


  },



  actions: {


    /**
     * Search mahasantri pembayaran
     */
    async search(keyword: string) {

      this.keyword = keyword;


      if (!keyword.trim()) {

        this.items = [];

        return;

      }


      this.loading = true;


      try {


        const { data } = await pembayaranService.search({

          keyword,

          limit: 8,

        });


        this.items = data.data;



      } catch (error) {


        console.error(
          "Gagal mencari pembayaran",
          error
        );


        this.items = [];


      } finally {


        this.loading = false;


      }

    },




    /**
     * pilih mahasantri
     */
    async selectMahasantri(id:number) {


      this.items = [];

      this.keyword = "";


      await this.fetchDetail(id);


    },





    /**
     * ambil detail pembayaran
     */
    async fetchDetail(id:number) {


      this.loadingDetail = true;


      try {


        const {data} =
          await pembayaranService.detail(id);



        this.detail = data.data;



      } catch(error){


        console.error(
          "Gagal mengambil detail pembayaran",
          error
        );


        this.detail = null;



      } finally {


        this.loadingDetail = false;


      }


    },





    clearDetail(){


      this.detail = null;


    },



    reset(){


      this.keyword = "";

      this.items = [];

      this.detail = null;


    },


  },


});