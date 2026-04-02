'use strict';

const listingsService = require('./listings.service');
const { sendSuccess } = require('../../utils/apiResponse');

/**
 * Listings Controller — handles req/res, delegates to service
 */

async function getAll(req, res) {
  const { page, limit, search, status } = req.query;
  const result = await listingsService.getAllListings({
    page: parseInt(page) || 1,
    limit: Math.min(parseInt(limit) || 20, 100),
    search,
    status,
  });

  sendSuccess(res, result.listings, 200, {
    total: result.total,
    page: result.page,
    limit: result.limit,
  });
}

async function getOne(req, res) {
  const listing = await listingsService.getListingById(req.params.id);
  sendSuccess(res, listing);
}

async function create(req, res) {
  const listing = await listingsService.createListing(req.body);
  sendSuccess(res, listing, 201);
}

async function update(req, res) {
  const listing = await listingsService.updateListing(req.params.id, req.body);
  sendSuccess(res, listing);
}

async function remove(req, res) {
  const result = await listingsService.deleteListing(req.params.id);
  sendSuccess(res, result);
}

async function uploadImage(req, res) {
  const { imageBase64, filename, contentType } = req.body;
  const result = await listingsService.uploadImage(imageBase64, filename, contentType);
  sendSuccess(res, result, 201);
}

module.exports = { getAll, getOne, create, update, remove, uploadImage };
