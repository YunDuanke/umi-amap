import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { connect } from 'dva';
import AMap from 'AMap';
import { SearchBar, Icon } from 'antd-mobile';
import addressIcon from '../assets/address.png';
import styles from './index.less';

const mapStateToProps = (state) => {
  const map = state['map'];
  return {
    map,
  };
};

const searchSelected = (dataSource, type, id, isParent) => {
  let selected = undefined;
  const searchSelectedFun = (dataSource, type, id) => {
    if (dataSource && dataSource.children) {
      dataSource.children.forEach(item => {
        if (item.type === type && item.id === id) {
          if (isParent) {
            selected = dataSource;
          } else {
            selected = item;
          }
        } else {
          searchSelectedFun(item, type, id);
        }
      });
    }
  };
  searchSelectedFun(dataSource, type, id);
  return selected;
};

const getMapPointTypeAndId = target => {
  let [id, type] = ['', ''];
  for (let key in target) {
    if (target[key] && target[key]['id']) {
      id = target[key]['id'];
      type = target[key]['type'];
    }
  }
  return { id, type };
};

const Index = (props) => {
  const { dispatch, map: { mapData, zoneId, shopId } } = props;
  const [map, setMap] = useState(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchContent, setSearchContent] = useState([]);

  useEffect(() => {
    setMap(new AMap.Map('container', {
      resizeEnable: true,
      zoom: 5,
      center: [107.4976, 32.1697],
      features: ['bg', 'road'],
    }));
    dispatch({
      type: 'map/fetch',
    });
  }, [dispatch]);

  const renderShop = useCallback(shops => {
    map.clearMap();
    shops && shops.forEach(item => {
      let url = addressIcon;
      map.add(new AMap.Marker({
        icon: new AMap.Icon({
          image: url,
          size: new AMap.Size(120, 120),
          imageSize: new AMap.Size(120, 120),
        }),
        position: [item.longitude, item.latitude],
        id: item.id,
        parentId: item.parentId || null,
        name: item.name,
        type: item.type,
        shopCode: item.shopCode,
      }).on('click', (e) => {
        const pointObj = getMapPointTypeAndId(e.target);
        const selected = searchSelected(mapData, pointObj && pointObj.type, pointObj && pointObj.id);
        dispatch({
          type: 'map/save',
          payload: {
            shopId: pointObj && pointObj.id,
          },
        });
        map.setZoomAndCenter(16, [selected.longitude, selected.latitude]);
      }));
      let text = new AMap.Text({
        text: item.name,
        position: new AMap.LngLat(item.longitude, item.latitude),
        anchor: 'bottom-left',
        offset: new AMap.Pixel(70, -10),
      });
      text.setStyle({
        'background-color': 'rgba(0,0,0,0)',
        border: 'none',
        'font-size': '36px',
        'font-family': 'PingFangSC-Medium',
      });
      map.add(text);
    });
  }, [dispatch, map, mapData]);

  const renderCircle = useCallback(zones => {
    map.clearMap();
    zones && zones.forEach(item => {
      map.add(new AMap.Circle({
        center: new AMap.LngLat(item.longitude, item.latitude), // 圆心位置
        radius: 150000,  //半径
        strokeColor: '#b9a27c',  //线颜色
        strokeOpacity: 0.9,  //线透明度
        strokeWeight: 3,  //线粗细度
        fillColor: '#b9a27c',  //填充颜色
        fillOpacity: 0.7, //填充透明度
        id: item.id,
        parentId: item.parentId || null,
        name: item.name,
        type: item.type,
      }).on('click', (e) => {
        const pointObj = getMapPointTypeAndId(e.target);
        const selected = searchSelected(mapData, pointObj && pointObj.type, pointObj && pointObj.id);
        dispatch({
          type: 'map/save',
          payload: {
            zoneId: pointObj && pointObj.id,
          },
        });
        if (selected && selected.children && selected.children.length) {
          if (selected.children[0].type === 'shop') {
            renderShop(selected.children);
            map.setZoomAndCenter(16, [selected.longitude, selected.latitude]);
          } else {
            renderCircle(selected.children);
            map.setCenter([selected.longitude, selected.latitude]);
          }
        }
      }));
      let text = new AMap.Text({
        text: item.name,
        position: new AMap.LngLat(item.longitude, item.latitude),
        anchor: 'bottom-left',
        offset: new AMap.Pixel(10, -10),
      });
      text.setStyle({
        'background-color': 'rgba(0,0,0,0)',
        border: 'none',
        'font-size': '36px',
        'font-family': 'PingFangSC-Medium',
      });
      map.add(text);
    });
  }, [dispatch, map, mapData, renderShop]);

  useEffect(() => {
    if (mapData && map) {
      renderCircle(mapData.children);
    }
  }, [map, mapData, renderCircle]);

  const goBack = () => {
    const selected = searchSelected(mapData, shopId ? 'shop' : 'zone', shopId || zoneId, true);
    if (shopId) {
      map.setCenter([selected.longitude, selected.latitude]);
      dispatch({
        type: 'map/save',
        payload: {
          shopId: undefined,
        },
      });
    } else {
      map.setZoomAndCenter(5, [selected.longitude, selected.latitude]);
      renderCircle(selected.children);
      dispatch({
        type: 'map/save',
        payload: {
          zoneId: selected.id,
        },
      });
    }
  };

  const onSubmit = val => {
    const data = [];
    if (mapData.name.toLowerCase().indexOf(val.toLowerCase()) >= 0) {
      data.push({
        id: mapData.id,
        parentId: mapData.parentId,
        type: mapData.type,
        name: mapData.name
      });
    }
    const searchSelectedFun = dataSource => {
      if (dataSource && dataSource.children) {
        dataSource.children.forEach(item => {
          if (item.name.toLowerCase().indexOf(val.toLowerCase()) >= 0) {
            data.push({
              id: item.id,
              parentId: item.parentId,
              type: item.type,
              name: item.name
            });
          }
          searchSelectedFun(item);
        });
      }
    };
    searchSelectedFun(mapData);
    setSearchContent(data)
  };

  const confirmZoneOrShop = val => {
    let [zoneId, shopId] = [undefined, undefined];
    if (val.type === mapData.type && val.id === mapData.id) {
      renderCircle(mapData.children);
    } else if(val.type === 'zone') {
      const selected = searchSelected(mapData, val.type, val.id);
      renderShop(selected.children);
      map.setZoomAndCenter(16, [selected.longitude, selected.latitude]);
      zoneId = val.id;
    } else {
      const selectedFather = searchSelected(mapData, val.type, val.id, true);
      const selected = searchSelected(mapData, val.type, val.id);
      renderShop(selectedFather.children);
      map.setZoomAndCenter(16, [selected.longitude, selected.latitude]);
      zoneId = val.parentId;
      shopId = val.shopId;
    }
    dispatch({
      type: 'map/save',
      payload: {
        zoneId,
        shopId
      },
    });
    setSearchVisible(false)
  };

  return (
    <div className={styles.map} id="map">
      <div className={styles.search}>
        <SearchBar
          placeholder="搜索区域、店铺"
          onSubmit={onSubmit}
          onFocus={() => setSearchVisible(true)}
          onCancel={() => setSearchVisible(false)}
          cancelText={<Icon type="cross" color="#8E8E93" style={{ marginTop: '.21rem' }}/>}
        />
      </div>
      {
        searchVisible ? <Fragment>
          <div className={styles.background} onClick={() => setSearchVisible(false)}/>
          <div className={styles.content}>
            {
              searchContent.map(v => (
                <div key={`${v.type}-${v.id}`}>
                  <div className={styles.adress}>
                    <img src={addressIcon} alt=""/>
                  </div>
                  <div className={styles.info}>
                    {v.name}
                  </div>
                  <div
                    className={styles.btn}
                    onClick={() => confirmZoneOrShop(v)}
                  >
                    确认
                  </div>
                </div>
              ))
            }
          </div>
        </Fragment> : null
      }
      <div id="container" className={styles.container}/>
      {
        zoneId && zoneId !== mapData.id ?
          <div className={styles.back} onClick={goBack}>
            返回上层
          </div> : null
      }
    </div>
  );
};
export default connect(mapStateToProps, null)(Index);
