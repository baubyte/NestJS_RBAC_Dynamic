import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { HttpAdapter } from '../interfaces/http-adapter.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AxiosAdapter implements HttpAdapter {
  private axios: AxiosInstance = axios;
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const { data } = await this.axios.get<T>(url, config);
      return data;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error(`Error in GET request - Check logs for more details`);
    }
  }
  async post<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const { data: responseData } = await this.axios.post<T>(
        url,
        data,
        config,
      );
      return responseData;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: any) {
      throw new Error(`Error in POST request - Check logs for more details`);
    }
  }

  async put<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const { data: responseData } = await this.axios.put<T>(url, data, config);
      return responseData;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error(`Error in PUT request - Check logs for more details`);
    }
  }
  async patch<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const { data: responseData } = await this.axios.patch<T>(
        url,
        data,
        config,
      );
      return responseData;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error(`Error in PATCH request - Check logs for more details`);
    }
  }
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const { data: responseData } = await this.axios.delete<T>(url, config);
      return responseData;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new Error(`Error in DELETE request - Check logs for more details`);
    }
  }
}
