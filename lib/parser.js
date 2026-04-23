import * as cheerio from 'cheerio';
import { normalizeUrl, cleanText } from '../utils/normalize.js';

export function parsePinterestData(html) {
  const $ = cheerio.load(html);
  const dataScript = $('#__PWS_DATA__').html();
  
  if (!dataScript) {
    return null;
  }

  try {
    return JSON.parse(dataScript);
  } catch (e) {
    console.error('Failed to parse __PWS_DATA__', e);
    return null;
  }
}

export function extractPins(data) {
  const results = data?.props?.initialReduxState?.pins || {};
  const searchResults = data?.props?.initialReduxState?.search?.results || [];
  const resourceResults = data?.props?.initialReduxState?.resources?.ResourceResponses?.SearchResource?.filter(r => r.options?.scope === 'pins')?.[0]?.response?.data?.results || [];

  const finalResults = searchResults.length > 0 ? searchResults : resourceResults;

  return finalResults.map(pinId => {
    const pin = typeof pinId === 'string' ? results[pinId] : pinId;
    if (!pin) return null;

    return {
      id: pin.id,
      title: cleanText(pin.title || pin.grid_title || ''),
      image_url: normalizeUrl(pin.images?.orig?.url || pin.images?.['736x']?.url),
      thumbnail_url: normalizeUrl(pin.images?.['236x']?.url),
      pin_url: `https://www.pinterest.com/pin/${pin.id}/`,
      source_url: normalizeUrl(pin.link || ''),
      domain: pin.domain || '',
      alt_text: cleanText(pin.description || pin.pinner?.full_name || '')
    };
  }).filter(Boolean);
}

export function extractUsers(data) {
  const results = data?.props?.initialReduxState?.users || {};
  const searchResults = data?.props?.initialReduxState?.search?.results || [];
  const resourceResults = data?.props?.initialReduxState?.resources?.ResourceResponses?.SearchResource?.filter(r => r.options?.scope === 'users')?.[0]?.response?.data?.results || [];

  const finalResults = searchResults.length > 0 ? searchResults : resourceResults;

  return finalResults.map(userId => {
    const user = typeof userId === 'string' ? results[userId] : userId;
    if (!user) return null;

    return {
      username: `@${user.username}`,
      display_name: cleanText(user.full_name),
      profile_url: `https://www.pinterest.com/${user.username}/`,
      followers: user.follower_count || 0,
      followers_text: `${user.follower_count || 0} followers`,
      avatar_url: normalizeUrl(user.image_medium_url || user.image_small_url),
      bio: cleanText(user.about || '')
    };
  }).filter(Boolean);
}

export function extractBoards(data) {
  const results = data?.props?.initialReduxState?.boards || {};
  const searchResults = data?.props?.initialReduxState?.search?.results || [];
  const resourceResults = data?.props?.initialReduxState?.resources?.ResourceResponses?.SearchResource?.filter(r => r.options?.scope === 'boards')?.[0]?.response?.data?.results || [];

  const finalResults = searchResults.length > 0 ? searchResults : resourceResults;

  return finalResults.map(boardId => {
    const board = typeof boardId === 'string' ? results[boardId] : boardId;
    if (!board) return null;

    return {
      board_name: cleanText(board.name),
      board_url: normalizeUrl(board.url),
      owner_username: board.owner?.username,
      cover_image_url: normalizeUrl(board.image_thumbnail_url),
      pin_count: board.pin_count || 0
    };
  }).filter(Boolean);
}
