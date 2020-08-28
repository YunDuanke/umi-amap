export default {
  namespace: 'map',

  state: {
    mapData: null,
    zoneId: undefined,
    shopId: undefined
  },

  effects: {
    * fetch({ callback }, { put }) {
      const testData = {
        id: 1,
        name: '区域1',
        type: 'zone',
        longitude: 118.99667173354743,
        latitude: 34.40750936368544,
        parentId: 0,
        children: [
          {
            id: 2,
            name: '区域1-1',
            type: 'zone',
            longitude: 116.46910056375907,
            latitude: 39.910552411826906,
            parentId: 28,
            children: [
              {
                id: 1,
                name: '店铺1-1-1',
                type: 'shop',
                longitude: 116.478893,
                latitude: 39.910106,
                parentId: 2,
              },
              {
                id: 2,
                name: '店铺1-1-2',
                type: 'shop',
                longitude: 116.459308,
                latitude: 39.910998,
                parentId: 2,
              },
            ],
          },
          {
            id: 3,
            name: '区域1-2',
            type: 'zone',
            longitude: 121.473975,
            latitude: 31.223430999999994,
            parentId: 28,
            children: [
              {
                id: 3,
                name: '店铺1-2-1',
                type: 'shop',
                longitude: 121.473975,
                latitude: 31.223431,
                parentId: 3,
              },
            ],
          },
          {
            id: 4,
            name: '区域1-3',
            type: 'zone',
            longitude: 118.7847,
            latitude: 32.044469,
            parentId: 28,
            children: [
              {
                id: 4,
                name: '店铺1-3-1',
                type: 'shop',
                longitude: 118.7847,
                latitude: 32.044469,
                parentId: 4,
              },
            ],
          },
        ],
      };
      yield put({
        type: 'save',
        payload: {
          mapData: testData,
        },
      });
      callback && callback(testData);
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
