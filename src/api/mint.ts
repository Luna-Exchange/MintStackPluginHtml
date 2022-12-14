import axios from 'axios';
import { FirstPartyAnswers, envs, EnvType } from '../type';

const BaseURL_Staging = 'https://creators-portals-api-staging-8lv8j.ondigitalocean.app';
const BaseURL_Product = 'https://api.mintstack.com';

export const getMintInfo = (collecttionId: string, env?: EnvType) =>
  new Promise((resolve: (value: any) => void, reject: (value: string) => void) => {
    let reqUrl = `${env === envs.PRODUCTION ? BaseURL_Product : BaseURL_Staging}/mint/${collecttionId}/info`;

    axios
      .get(reqUrl)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });

export const getAllAssets = (collecttionId: string, env?: EnvType, page?: number, size?: number, keyword?: string, assetsIds?: string[], dateSort?: string) =>
  new Promise((resolve: (value: any) => void, reject: (value: string) => void) => {
    let reqUrl = `${env === envs.PRODUCTION ? BaseURL_Product : BaseURL_Staging}/mint/${collecttionId}/assets${
      !!page || !!size || !!keyword || Array.isArray(assetsIds) || !!dateSort ? '?' : ''
    }`;
    if (!!page) reqUrl += `page=${page}`;
    if (!!size) reqUrl += `&size=${size}`;
    if (!!keyword) reqUrl += `&keyword=${keyword}`;
    if (Array.isArray(assetsIds)) reqUrl += `&assets_ids=${encodeURIComponent(JSON.stringify(assetsIds))}`;
    if (!!dateSort) reqUrl += `&date_sort=${dateSort}`;

    axios
      .get(reqUrl)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
export const answerMintQuestions = (collecttionId: string, wallet: string, answers: FirstPartyAnswers[], env?: EnvType) =>
  new Promise((resolve: (value: any) => void, reject: (value: string) => void) => {
    let reqUrl = `${env === envs.PRODUCTION ? BaseURL_Product : BaseURL_Staging}/mint/${collecttionId}/answers`;

    const body: any = {};
    body['wallet_address'] = wallet;
    body['answers'] = answers;

    axios
      .post(reqUrl, body)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
