const truncateString = (str: string, maxLength: number, suffix: string = '...'): string => {
    if (str.length <= maxLength) {
      return str;
    }

    const truncatedLength = maxLength - suffix.length;
    return str.substring(0, truncatedLength) + suffix;
}

export default truncateString; 